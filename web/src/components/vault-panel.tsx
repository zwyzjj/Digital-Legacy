"use client";

import { useCallback, useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import {
  encodeFunctionData,
  isAddress,
  parseEther,
  type Address,
  type Hex,
} from "viem";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLegacyContractAddress } from "@/lib/contracts";
import { legacyAbi } from "@/lib/legacyAbi";
import { DEV_SIGNER_ENABLED, getDevSigner } from "@/lib/dev-signer";

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const EXPLORER_TX = "https://chainscan-galileo.0g.ai/tx";
const CHAIN_ID_DEC = 16602;
const CHAIN_ID_HEX = `0x${CHAIN_ID_DEC.toString(16)}`; // 0x40da

function formatError(e: unknown): string {
  console.error("[Vault] tx error:", e);
  if (typeof e === "string") return e;
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "object" && e !== null) {
    const obj = e as {
      shortMessage?: string;
      message?: string;
      reason?: string;
      code?: number | string;
      data?: { message?: string } | string;
    };
    if (obj.shortMessage) return obj.shortMessage;
    if (typeof obj.data === "object" && obj.data?.message) return obj.data.message;
    if (typeof obj.data === "string") return obj.data;
    if (obj.message) return `${obj.message}${obj.code ? ` (code ${obj.code})` : ""}`;
    if (obj.reason) return obj.reason;
    try {
      return JSON.stringify(e, Object.getOwnPropertyNames(e as object));
    } catch {
      return "Unknown error (see DevTools Console for details)";
    }
  }
  return "Unknown error (see DevTools Console for details)";
}

function TxLine({ label, hash }: { label: string; hash?: Hex }) {
  if (!hash) return null;
  return (
    <p className="text-muted-foreground break-all text-xs">
      {label}:{" "}
      <a
        className="text-primary underline"
        href={`${EXPLORER_TX}/${hash}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        {hash}
      </a>
    </p>
  );
}

function toHex(value: bigint): Hex {
  return `0x${value.toString(16)}`;
}

async function ensureChain(provider: Eip1193Provider) {
  const current = (await provider.request({ method: "eth_chainId" })) as string;
  if (current?.toLowerCase() === CHAIN_ID_HEX) return;
  await provider.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: CHAIN_ID_HEX }],
  });
}

async function getProviderAndAccount(): Promise<{
  provider: Eip1193Provider;
  account: Address;
}> {
  const provider = typeof window !== "undefined" ? window.ethereum : undefined;
  if (!provider)
    throw new Error("MetaMask not detected (window.ethereum missing)");
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts?.[0]) throw new Error("No authorized account");
  await ensureChain(provider);
  return { provider, account: accounts[0] as Address };
}

async function rpcViaProxy<T = unknown>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch("/api/rpc", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    cache: "no-store",
  });
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(`${method} failed: ${json.error.message}`);
  return json.result as T;
}

// 0G Galileo Testnet minimum priority fee = 2 gwei. We use 2.5 gwei for headroom.
const MIN_PRIORITY_FEE_WEI = BigInt(2_500_000_000);

async function sendTxViaDevSigner(params: {
  to: Address;
  data: Hex;
  value?: bigint;
}): Promise<Hex> {
  const signer = getDevSigner();
  if (!signer) throw new Error("Dev signer not available");
  const { client, address } = signer;

  const valueHex = params.value !== undefined ? toHex(params.value) : "0x0";
  const [gasEst, baseGasPrice] = await Promise.all([
    rpcViaProxy<Hex>("eth_estimateGas", [
      {
        from: address,
        to: params.to,
        data: params.data,
        value: valueHex,
      },
    ]).catch(() => "0x493e0" as Hex),
    rpcViaProxy<Hex>("eth_gasPrice", []).catch(() => "0x3b9aca00" as Hex),
  ]);
  const gasWithBuffer = (BigInt(gasEst) * BigInt(120)) / BigInt(100);
  const basePrice = BigInt(baseGasPrice);
  const maxPriorityFeePerGas = MIN_PRIORITY_FEE_WEI;
  const maxFeePerGas =
    basePrice > maxPriorityFeePerGas
      ? basePrice + maxPriorityFeePerGas
      : maxPriorityFeePerGas * BigInt(2);

  console.log("[Vault][DevSigner] sending tx:", {
    to: params.to,
    value: valueHex,
    gas: gasWithBuffer.toString(),
    maxFeePerGas: maxFeePerGas.toString(),
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
  });

  const hash = await client.sendTransaction({
    account: client.account!,
    chain: client.chain,
    to: params.to,
    data: params.data,
    value: params.value ?? BigInt(0),
    gas: gasWithBuffer,
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  return hash;
}

async function sendTx(
  provider: Eip1193Provider,
  params: { from: Address; to: Address; data: Hex; value?: bigint },
): Promise<Hex> {
  const valueHex = params.value !== undefined ? toHex(params.value) : "0x0";

  const [gasEst, baseGasPrice, nonce] = await Promise.all([
    rpcViaProxy<Hex>("eth_estimateGas", [
      {
        from: params.from,
        to: params.to,
        data: params.data,
        value: valueHex,
      },
    ]).catch(() => "0x493e0" as Hex),
    rpcViaProxy<Hex>("eth_gasPrice", []).catch(() => "0x3b9aca00" as Hex),
    rpcViaProxy<Hex>("eth_getTransactionCount", [params.from, "pending"]),
  ]);

  const gasInt = BigInt(gasEst);
  const gasWithBuffer = (gasInt * BigInt(120)) / BigInt(100);
  const gasHex = toHex(gasWithBuffer);

  const basePrice = BigInt(baseGasPrice);
  const maxPriorityFeePerGas = MIN_PRIORITY_FEE_WEI;
  const maxFeePerGas =
    basePrice > maxPriorityFeePerGas
      ? basePrice + maxPriorityFeePerGas
      : maxPriorityFeePerGas * BigInt(2);

  const tx: Record<string, string> = {
    from: params.from,
    to: params.to,
    data: params.data,
    value: valueHex,
    gas: gasHex,
    maxFeePerGas: toHex(maxFeePerGas),
    maxPriorityFeePerGas: toHex(maxPriorityFeePerGas),
    nonce,
  };

  console.log("[Vault] sending EIP-1559 tx with pre-filled params:", tx);

  const hash = (await provider.request({
    method: "eth_sendTransaction",
    params: [tx],
  })) as Hex;
  return hash;
}

export function Vault() {
  const contractAddress = getLegacyContractAddress();

  const [account, setAccount] = useState<Address | undefined>();
  const [chainId, setChainId] = useState<string | undefined>();

  useEffect(() => {
    if (DEV_SIGNER_ENABLED) {
      const signer = getDevSigner();
      if (signer) {
        setAccount(signer.address);
        setChainId(CHAIN_ID_HEX);
      }
      return;
    }
    const eth = typeof window !== "undefined" ? window.ethereum : undefined;
    if (!eth) return;
    eth
      .request({ method: "eth_accounts" })
      .then((res) => {
        const a = (res as string[])?.[0];
        if (a) setAccount(a as Address);
      })
      .catch(() => {});
    eth
      .request({ method: "eth_chainId" })
      .then((res) => setChainId(res as string))
      .catch(() => {});
    const onAccountsChanged = (...args: unknown[]) => {
      const a = (args[0] as string[])?.[0];
      setAccount(a ? (a as Address) : undefined);
    };
    const onChainChanged = (...args: unknown[]) => {
      setChainId(args[0] as string);
    };
    eth.on?.("accountsChanged", onAccountsChanged);
    eth.on?.("chainChanged", onChainChanged);
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      const { account: a, provider } = await getProviderAndAccount();
      setAccount(a);
      const c = (await provider.request({ method: "eth_chainId" })) as string;
      setChainId(c);
    } catch (e) {
      console.error("connect error", e);
    }
  }, []);

  const [busy, setBusy] = useState<"" | "create" | "ping" | "claim">("");

  const [beneficiary, setBeneficiary] = useState("");
  const [pingIntervalSec, setPingIntervalSec] = useState("86400");
  const [depositOg, setDepositOg] = useState("0.01");

  const [pingVaultId, setPingVaultId] = useState("0");
  const [claimVaultId, setClaimVaultId] = useState("0");

  const [createHash, setCreateHash] = useState<Hex | undefined>();
  const [pingHash, setPingHash] = useState<Hex | undefined>();
  const [claimHash, setClaimHash] = useState<Hex | undefined>();

  const [errCreate, setErrCreate] = useState("");
  const [errPing, setErrPing] = useState("");
  const [errClaim, setErrClaim] = useState("");

  const createWait = useWaitForTransactionReceipt({ hash: createHash });
  const pingWait = useWaitForTransactionReceipt({ hash: pingHash });
  const claimWait = useWaitForTransactionReceipt({ hash: claimHash });

  const locked = busy !== "";

  const onCreate = async () => {
    setErrCreate("");
    setCreateHash(undefined);
    if (!isAddress(beneficiary)) {
      setErrCreate("Invalid beneficiary address");
      return;
    }
    let valueWei: bigint;
    try {
      valueWei = parseEther(depositOg || "0");
    } catch {
      setErrCreate("Invalid deposit (OG)");
      return;
    }
    if (valueWei === BigInt(0)) {
      setErrCreate("Deposit must be > 0 OG");
      return;
    }
    let period: bigint;
    try {
      period = BigInt(pingIntervalSec);
    } catch {
      setErrCreate("Invalid ping interval (seconds)");
      return;
    }
    setBusy("create");
    try {
      const data = encodeFunctionData({
        abi: legacyAbi,
        functionName: "createVault",
        args: [beneficiary as Address, period],
      });
      let hash: Hex;
      if (DEV_SIGNER_ENABLED) {
        hash = await sendTxViaDevSigner({
          to: contractAddress,
          data,
          value: valueWei,
        });
      } else {
        const { provider, account: from } = await getProviderAndAccount();
        setAccount(from);
        hash = await sendTx(provider, {
          from,
          to: contractAddress,
          data,
          value: valueWei,
        });
      }
      setCreateHash(hash);
    } catch (e) {
      setErrCreate(formatError(e));
    } finally {
      setBusy("");
    }
  };

  const onPing = async () => {
    setErrPing("");
    setPingHash(undefined);
    let id: bigint;
    try {
      id = BigInt(pingVaultId);
    } catch {
      setErrPing("Invalid vault id");
      return;
    }
    setBusy("ping");
    try {
      const data = encodeFunctionData({
        abi: legacyAbi,
        functionName: "ping",
        args: [id],
      });
      let hash: Hex;
      if (DEV_SIGNER_ENABLED) {
        hash = await sendTxViaDevSigner({ to: contractAddress, data });
      } else {
        const { provider, account: from } = await getProviderAndAccount();
        setAccount(from);
        hash = await sendTx(provider, { from, to: contractAddress, data });
      }
      setPingHash(hash);
    } catch (e) {
      setErrPing(formatError(e));
    } finally {
      setBusy("");
    }
  };

  const onClaim = async () => {
    setErrClaim("");
    setClaimHash(undefined);
    let id: bigint;
    try {
      id = BigInt(claimVaultId);
    } catch {
      setErrClaim("Invalid vault id");
      return;
    }
    setBusy("claim");
    try {
      const data = encodeFunctionData({
        abi: legacyAbi,
        functionName: "claim",
        args: [id],
      });
      let hash: Hex;
      if (DEV_SIGNER_ENABLED) {
        hash = await sendTxViaDevSigner({ to: contractAddress, data });
      } else {
        const { provider, account: from } = await getProviderAndAccount();
        setAccount(from);
        hash = await sendTx(provider, { from, to: contractAddress, data });
      }
      setClaimHash(hash);
    } catch (e) {
      setErrClaim(formatError(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <Card className="border-zinc-700 bg-zinc-950 text-zinc-100 ring-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-zinc-50">
              Wallet
              {DEV_SIGNER_ENABLED ? (
                <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Dev Signer
                </span>
              ) : null}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {account ? (
                <>
                  <span className="break-all font-mono text-xs text-emerald-400">
                    {account}
                  </span>
                  {chainId && chainId.toLowerCase() !== CHAIN_ID_HEX ? (
                    <span className="ml-2 text-amber-400">
                      (wrong chain {chainId} — will auto-switch)
                    </span>
                  ) : null}
                </>
              ) : (
                "Not connected"
              )}
            </CardDescription>
          </div>
          {!account && !DEV_SIGNER_ENABLED && (
            <Button onClick={() => void connect()} size="sm">
              Connect
            </Button>
          )}
        </CardHeader>
      </Card>

      <Card className="border-zinc-700 bg-zinc-950 text-zinc-100 ring-zinc-700">
        <CardHeader>
          <CardTitle className="text-zinc-50">Create vault</CardTitle>
          <CardDescription className="text-zinc-400">
            Calls{" "}
            <code className="text-zinc-300">createVault(beneficiary, inactivityPeriod)</code>{" "}
            with native OG (contract requires msg.value &gt; 0). Interval is the ping /
            inactivity window in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="text-sm text-zinc-400">Beneficiary</label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            placeholder="0x..."
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value.trim())}
          />
          <label className="text-sm text-zinc-400">
            Ping interval (seconds) — default 86400 (1 day)
          </label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            type="text"
            inputMode="numeric"
            value={pingIntervalSec}
            onChange={(e) => setPingIntervalSec(e.target.value)}
          />
          <label className="text-sm text-zinc-400">Deposit (OG)</label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            type="text"
            value={depositOg}
            onChange={(e) => setDepositOg(e.target.value)}
          />
          <Button disabled={locked} onClick={() => void onCreate()} type="button">
            {busy === "create" ? "Confirm in wallet…" : "Create vault"}
          </Button>
          {createHash && createWait.isPending ? (
            <p className="text-xs text-zinc-400">Waiting for confirmation…</p>
          ) : null}
          {createWait.isSuccess && createHash ? (
            <p className="text-xs text-emerald-400">Confirmed on-chain.</p>
          ) : null}
          {errCreate ? <p className="text-sm text-red-400">{errCreate}</p> : null}
          <TxLine hash={createHash} label="Tx" />
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-950 text-zinc-100 ring-zinc-700">
        <CardHeader>
          <CardTitle className="text-zinc-50">Ping</CardTitle>
          <CardDescription className="text-zinc-400">
            Owner only — <code className="text-zinc-300">ping(vaultId)</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="text-sm text-zinc-400">Vault id</label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            value={pingVaultId}
            onChange={(e) => setPingVaultId(e.target.value)}
          />
          <Button
            disabled={locked}
            onClick={() => void onPing()}
            type="button"
            variant="secondary"
          >
            {busy === "ping" ? "Confirm in wallet…" : "Ping"}
          </Button>
          {pingHash && pingWait.isPending ? (
            <p className="text-xs text-zinc-400">Waiting for confirmation…</p>
          ) : null}
          {pingWait.isSuccess && pingHash ? (
            <p className="text-xs text-emerald-400">Confirmed on-chain.</p>
          ) : null}
          {errPing ? <p className="text-sm text-red-400">{errPing}</p> : null}
          <TxLine hash={pingHash} label="Tx" />
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-950 text-zinc-100 ring-zinc-700">
        <CardHeader>
          <CardTitle className="text-zinc-50">Claim</CardTitle>
          <CardDescription className="text-zinc-400">
            Beneficiary only — <code className="text-zinc-300">claim(vaultId)</code> after
            inactivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label className="text-sm text-zinc-400">Vault id</label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            value={claimVaultId}
            onChange={(e) => setClaimVaultId(e.target.value)}
          />
          <Button
            disabled={locked}
            onClick={() => void onClaim()}
            type="button"
            variant="outline"
          >
            {busy === "claim" ? "Confirm in wallet…" : "Claim"}
          </Button>
          {claimHash && claimWait.isPending ? (
            <p className="text-xs text-zinc-400">Waiting for confirmation…</p>
          ) : null}
          {claimWait.isSuccess && claimHash ? (
            <p className="text-xs text-emerald-400">Confirmed on-chain.</p>
          ) : null}
          {errClaim ? <p className="text-sm text-red-400">{errClaim}</p> : null}
          <TxLine hash={claimHash} label="Tx" />
        </CardContent>
      </Card>
    </div>
  );
}

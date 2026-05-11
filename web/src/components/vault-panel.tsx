"use client";

import { useState } from "react";
import {
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddress, parseEther, type Address, type Hex } from "viem";

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

const EXPLORER_TX = "https://chainscan-galileo.0g.ai/tx";

function formatError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
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

export function Vault() {
  const contractAddress = getLegacyContractAddress();

  const { writeContractAsync } = useWriteContract();

  const [busy, setBusy] = useState<"" | "create" | "ping" | "claim">("");

  const [beneficiary, setBeneficiary] = useState("");
  const [inactivitySec, setInactivitySec] = useState("86400");
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

  const onCreate = async () => {
    setErrCreate("");
    setCreateHash(undefined);
    if (!isAddress(beneficiary)) {
      setErrCreate("Invalid beneficiary address");
      return;
    }
    let valueWei;
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
      period = BigInt(inactivitySec);
    } catch {
      setErrCreate("Invalid inactivity period (seconds)");
      return;
    }
    setBusy("create");
    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: legacyAbi,
        functionName: "createVault",
        args: [beneficiary as Address, period],
        value: valueWei,
      });
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
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: legacyAbi,
        functionName: "ping",
        args: [id],
      });
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
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: legacyAbi,
        functionName: "claim",
        args: [id],
      });
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
        <CardHeader>
          <CardTitle className="text-zinc-50">Create vault</CardTitle>
          <CardDescription className="text-zinc-400">
            Calls{" "}
            <code className="text-zinc-300">createVault(beneficiary, inactivityPeriod)</code>{" "}
            with native OG (contract requires msg.value &gt; 0).
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
            Inactivity period (seconds) — default 1 day
          </label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            type="text"
            inputMode="numeric"
            value={inactivitySec}
            onChange={(e) => setInactivitySec(e.target.value)}
          />
          <label className="text-sm text-zinc-400">Deposit (OG)</label>
          <Input
            className="border-zinc-600 bg-zinc-900 text-zinc-100"
            type="text"
            value={depositOg}
            onChange={(e) => setDepositOg(e.target.value)}
          />
          <Button
            disabled={busy === "create"}
            onClick={() => void onCreate()}
            type="button"
          >
            {busy === "create" ? "Confirm in wallet…" : "Create vault"}
          </Button>
          {createHash && createWait.isPending ? (
            <p className="text-xs text-zinc-400">Waiting for confirmation…</p>
          ) : null}
          {createWait.isSuccess && createHash ? (
            <p className="text-xs text-emerald-400">Confirmed on-chain.</p>
          ) : null}
          {errCreate ? (
            <p className="text-sm text-red-400">{errCreate}</p>
          ) : null}
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
            disabled={busy === "ping"}
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
            disabled={busy === "claim"}
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

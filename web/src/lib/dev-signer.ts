import {
  createWalletClient,
  defineChain,
  http,
  type Address,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RAW_KEY = process.env.NEXT_PUBLIC_DEV_PRIVATE_KEY?.trim();

export const DEV_SIGNER_ENABLED =
  process.env.NEXT_PUBLIC_DEV_SIGNER?.toLowerCase() === "true" && !!RAW_KEY;

const ogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: ["/api/rpc"] },
  },
  blockExplorers: {
    default: { name: "Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

let cached: { client: WalletClient; address: Address } | null = null;

export function getDevSigner(): { client: WalletClient; address: Address } | null {
  if (!DEV_SIGNER_ENABLED || !RAW_KEY) return null;
  if (cached) return cached;
  const account = privateKeyToAccount(RAW_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: ogGalileo,
    transport: http("/api/rpc", {
      timeout: 30_000,
      retryCount: 1,
    }),
  });
  cached = { client, address: account.address };
  return cached;
}

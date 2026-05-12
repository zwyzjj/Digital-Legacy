import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain, http } from "viem";

const DIRECT_RPC =
  process.env.NEXT_PUBLIC_RPC_URL?.trim() || "https://evmrpc-testnet.0g.ai";

// Browser hits the same-origin Next.js proxy to bypass missing CORS on 0G RPC.
// SSR / build-time fall back to the upstream URL directly.
const RPC_URL = typeof window !== "undefined" ? "/api/rpc" : DIRECT_RPC;

export const ogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: [DIRECT_RPC] },
  },
  blockExplorers: {
    default: { name: "Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Digital Legacy",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id",
  chains: [ogGalileo],
  transports: {
    [ogGalileo.id]: http(RPC_URL, {
      timeout: 60_000,
      retryCount: 3,
      retryDelay: 500,
    }),
  },
  ssr: true,
});

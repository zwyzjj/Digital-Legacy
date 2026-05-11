import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const ogGalileo = defineChain({
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "OG", symbol: "OG", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "Chainscan", url: "https://chainscan-galileo.0g.ai" },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "Digital Legacy",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id",
  chains: [ogGalileo],
  ssr: true,
});

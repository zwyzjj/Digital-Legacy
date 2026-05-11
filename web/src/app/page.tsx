"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

import { Vault } from "@/components/vault-panel";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-10 bg-black px-4 py-10 text-white">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Digital Legacy</h1>
        <p className="text-xl italic text-zinc-400">
          Some words travel farther than we do.
        </p>
        <ConnectButton />
      </div>
      <Vault />
    </main>
  );
}

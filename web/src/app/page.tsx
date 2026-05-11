"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-5xl font-bold tracking-tight">Digital Legacy</h1>
      <p className="text-xl text-gray-400 italic">Some words travel farther than we do.</p>
      <ConnectButton />
    </main>
  );
}

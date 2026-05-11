import { isAddress, type Address } from "viem";

const FALLBACK_LEGACY =
  "0x240Da01C20eCC768baebf57a4a4dEcD0388e5aB6" as const;

/** Deployed Legacy.sol — prefer `NEXT_PUBLIC_LEGACY_ADDRESS` from `.env.local`. */
export function getLegacyContractAddress(): Address {
  const raw = process.env.NEXT_PUBLIC_LEGACY_ADDRESS;
  if (raw && isAddress(raw)) return raw;
  return FALLBACK_LEGACY;
}

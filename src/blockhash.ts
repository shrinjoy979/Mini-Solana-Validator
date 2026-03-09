import crypto from "crypto"
import bs58Import from "bs58"

const bs58: any = (bs58Import as any).default || bs58Import

const hashes = new Set<string>()

export function createBlockhash() {
  const hash = bs58.encode(crypto.randomBytes(32))
  hashes.add(hash)
  return hash
}

export function isValid(hash: string) {
  return hashes.has(hash)
}
import { Transaction } from "@solana/web3.js"
import nacl from "tweetnacl"
import bs58Import from "bs58"

import * as ledger from "./ledger"
import { isValid } from "./blockhash"
import { executeSystem } from "./programs/system"

const bs58: any = (bs58Import as any).default || bs58Import

export async function processTransaction(params: any[]) {

  if (!params || params.length === 0 || !params[0]) {
    throw { code: -32602, message: "Invalid params" }
  }

  const encoded = params[0]

  let raw: Buffer
  try {
    raw = Buffer.from(encoded, "base64")
  } catch {
    throw { code: -32602, message: "Invalid params" }
  }

  let tx: Transaction
  try {
    tx = Transaction.from(raw)
  } catch {
    throw { code: -32602, message: "Invalid transaction" }
  }

  if (!tx.signatures || tx.signatures.length === 0) {
    throw { code: -32003, message: "Missing signatures" }
  }

  if (!tx.signatures[0].signature) {
    throw { code: -32003, message: "Missing signatures" }
  }

  const sig = bs58.encode(tx.signatures[0].signature)

  if (!isValid(tx.recentBlockhash)) {
    throw { code: -32003, message: "Invalid blockhash" }
  }

  const message = tx.serializeMessage()

  for (const s of tx.signatures) {

    if (!s.signature) {
      throw { code: -32003, message: "Missing signatures" }
    }

    const ok = nacl.sign.detached.verify(
      message,
      s.signature,
      s.publicKey.toBytes()
    )

    if (!ok) {
      throw { code: -32003, message: "Invalid signature" }
    }
  }

  for (const ix of tx.instructions) {

    const program = ix.programId.toBase58()

    if (program === "11111111111111111111111111111111") {
      executeSystem(ix)
    }
  }

  ledger.incrementSlot()
  ledger.incrementBlockHeight()

  ledger.signatures.set(sig, {
    slot: ledger.getSlot(),
    confirmations: null,
    err: null,
    confirmationStatus: "confirmed"
  })

  return sig
}
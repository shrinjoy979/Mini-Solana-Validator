import * as ledger from "./ledger"
import { createBlockhash } from "./blockhash"
import { processTransaction } from "./txProcessor"

export default async function handleRPC(method: string, params: any[]) {

  switch (method) {

    case "getVersion":
      return {
        "solana-core": "1.17.0",
        "feature-set": 1
      }

    case "getHealth":
      return "ok"

    case "getSlot":
      return ledger.getSlot()

    case "getBlockHeight":
      return ledger.getBlockHeight()

    case "getBalance": {

      const pubkey = params[0]
      const acc = ledger.getAccount(pubkey)

      return {
        context: { slot: ledger.getSlot() },
        value: acc ? acc.lamports : 0
      }
    }

    case "requestAirdrop": {

      const [pubkey, lamports] = params

      ledger.credit(pubkey, lamports)

      const sig = Math.random().toString(36)

      ledger.signatures.set(sig, {
        slot: ledger.getSlot(),
        confirmations: null,
        err: null,
        confirmationStatus: "confirmed"
      })

      return sig
    }

    case "getLatestBlockhash": {

      const blockhash = createBlockhash()

      return {
        context: { slot: ledger.getSlot() },
        value: {
          blockhash,
          lastValidBlockHeight: ledger.getBlockHeight() + 150
        }
      }
    }

    case "sendTransaction":
      return processTransaction(params)

    case "getSignatureStatuses": {

      const sigs = params[0]

      return {
        context: { slot: ledger.getSlot() },
        value: sigs.map((sig: string) => {

          const status = ledger.signatures.get(sig)

          if (!status) return null

          return {
            slot: status.slot,
            confirmations: null,
            err: null,
            confirmationStatus: "confirmed"
          }
        })
      }
    }

    case "getAccountInfo": {

      const pubkey = params[0]
      const acc = ledger.getAccount(pubkey)

      if (!acc) {
        return {
          context: { slot: ledger.getSlot() },
          value: null
        }
      }

      return {
        context: { slot: ledger.getSlot() },
        value: {
          data: [acc.data.toString("base64"), "base64"],
          executable: acc.executable,
          lamports: acc.lamports,
          owner: acc.owner,
          rentEpoch: acc.rentEpoch
        }
      }
    }

    case "getMinimumBalanceForRentExemption": {
      const size = params[0]
      return (size + 128) * 2
    }

    default:
      throw {
        code: -32601,
        message: "Method not found"
      }
  }
}
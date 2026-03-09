import * as ledger from "../ledger"

export function executeSystem(ix: any) {

  const data: Buffer = ix.data

  const disc = data.readUInt32LE(0)

  if (disc === 2) {

    const lamports = Number(data.readBigUInt64LE(4))

    const from = ix.keys[0].pubkey.toBase58()
    const to = ix.keys[1].pubkey.toBase58()

    let fromAcc = ledger.getAccount(from)
    let toAcc = ledger.getAccount(to)

    if (!fromAcc) {
      throw { code: -32003, message: "Source account missing" }
    }

    if (fromAcc.lamports < lamports) {
      throw { code: -32003, message: "Insufficient funds" }
    }

    if (!toAcc) {
      toAcc = ledger.createAccount(to)
    }

    fromAcc.lamports -= lamports
    toAcc.lamports += lamports
  }
}
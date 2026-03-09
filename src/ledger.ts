export const accounts = new Map<string, any>()
export const signatures = new Map<string, any>()

let slot = 1
let blockHeight = 1

export function getSlot() {
  return slot
}

export function getBlockHeight() {
  return blockHeight
}

export function incrementSlot() {
  slot++
}

export function incrementBlockHeight() {
  blockHeight++
}

export function getAccount(pubkey: string) {
  return accounts.get(pubkey) || null
}

export function createAccount(pubkey: string) {

  const acc = {
    lamports: 0,
    owner: "11111111111111111111111111111111",
    data: Buffer.alloc(0),
    executable: false,
    rentEpoch: 0
  }

  accounts.set(pubkey, acc)
  return acc
}

export function credit(pubkey: string, lamports: number) {

  let acc = accounts.get(pubkey)

  if (!acc) acc = createAccount(pubkey)

  acc.lamports += lamports
}
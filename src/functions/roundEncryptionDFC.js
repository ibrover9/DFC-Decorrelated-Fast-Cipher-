import { KC, KD, RTTable } from '@/constants/constants'

const MOD64 = 2n ** 64n
const MOD64_PLUS_13 = MOD64 + 13n

function RT(input) {
  return RTTable[Number(input)]
}

function splitKey(Key) {
  const left = Key >> 64n
  const right = Key & 0xffffffffffffffffn
  return { left, right }
}

export function roundEncryption(L, R, key, odd) {
  const { left: Ai, right: Bi } = splitKey(key)
  const Z = ((Ai * L + Bi) % MOD64_PLUS_13) % MOD64
  const Zl = Z >> 32n
  const Zr = Z & 0xffffffffn
  const truncatedZl = Zl & 0x3fn
  const RTResult = RT(truncatedZl)
  const Yl = (Zr ^ BigInt(RTResult)) << 32n
  const Yr = ((Zl ^ KC) + (KD % MOD64)) & 0xffffffffn
  const Y = Yl | Yr
  if (odd) {
    const finalResult = ((Y ^ R) << 64n) | L
    return finalResult
  } else {
    const finalResult = L | ((Y ^ R) << 64n)
    return finalResult
  }
}

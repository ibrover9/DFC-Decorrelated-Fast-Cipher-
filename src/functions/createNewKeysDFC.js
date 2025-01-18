import { KA, KB, K0 } from '@/constants/constants'
import { hexToBigInt } from './hexToBigInt'
import { splitMessage } from './splitMessage'
import { bigIntToHex } from './bigIntToHexDFC'
import { roundEncryption } from './roundEncryptionDFC'

export function createNewKeysDFC(Key) {
  const fullKey = BigInt('0x' + Key)
  let PK = []
  for (let i = 0; i < 8; i++) {
    PK.push((fullKey >> BigInt(i * 32)) & 0xffffffffn)
  }
  const OA1 = PK[0] | PK[7]
  const OB1 = PK[4] | PK[3]
  const EA1 = PK[1] | PK[6]
  const EB1 = PK[5] | PK[2]
  let OK = []
  let EK = []
  for (let i = 1; i <= 4; i++) {
    const OA = OA1 ^ KA[i - 1]
    const OB = OB1 ^ KB[i - 1]
    const EA = EA1 ^ KA[i - 1]
    const EB = EB1 ^ KB[i - 1]
    OK.push(OA, OB)
    EK.push(EA, EB)
  }
  let KCurrent = K0
  let keys = [KCurrent]
  let counterOK = 0
  let counterEK = 0
  for (let i = 1; i <= 8; i++) {
    const MOD2 = i % 2 === 1
    if (MOD2) {
      const { left: L, right: R } = splitMessage(hexToBigInt(keys[i - 1]))
      KCurrent = roundEncryption(L, R, OK[counterOK], true)
      counterOK++
    } else {
      const { left: L, right: R } = splitMessage(hexToBigInt(keys[i - 1]))
      KCurrent = roundEncryption(L, R, EK[counterEK], true)
      counterEK++
    }
    const hexResultKCurrent = bigIntToHex(KCurrent, 16)
    keys.push(hexResultKCurrent)
  }
  keys.shift()
  const numberBlock = localStorage.getItem('numberBlock')
  localStorage.setItem(`myArray${numberBlock}`, JSON.stringify(keys))
  const newNumberBlock = Number(numberBlock) + 1
  localStorage.setItem('numberBlock', newNumberBlock)
  return { Keys: keys }
}

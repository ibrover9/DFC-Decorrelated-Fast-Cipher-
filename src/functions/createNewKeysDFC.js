import { KA, KB } from '@/constants/constants'
import { hexToBigInt } from './hexToBigInt'
import { splitMessage } from './splitMessage'
import { bigIntToHex } from './bigIntToHexDFC'
import { roundEncryption } from './roundEncryptionDFC'

export function createNewKeysDFC(Key) {
  let K0 = '11111111111111111111111111111111'
  console.log('Initial Key (K): ', Key)

  // Шаг 1: Переводим в BigInt
  let fullKey = BigInt('0x' + Key)
  console.log('fullKey: ', fullKey.toString(16))

  // Разбиваем ключ на 8 частей по 32 бита каждая
  let PK = []
  for (let i = 0; i < 8; i++) {
    PK.push((fullKey >> BigInt(i * 32)) & 0xffffffffn)
  }
  console.log(
    'PK: ',
    PK.map((num) => num.toString(16).padStart(8, '0')),
  )

  // Определяем вспомогательные переменные
  let OA1 = PK[0] | PK[7]
  let OB1 = PK[4] | PK[3]
  let EA1 = PK[1] | PK[6]
  let EB1 = PK[5] | PK[2]
  console.log('OA1: ', OA1.toString(16))
  console.log('OB1: ', OB1.toString(16))
  console.log('EA1: ', EA1.toString(16))
  console.log('EB1: ', EB1.toString(16))

  // Вычисление OA, OB, EA, EB для i = 2, 3, 4
  let OK = []
  let EK = []
  for (let i = 1; i <= 4; i++) {
    let OA = OA1 ^ KA[i - 1]
    let OB = OB1 ^ KB[i - 1]
    let EA = EA1 ^ KA[i - 1]
    let EB = EB1 ^ KB[i - 1]

    OK.push(OA, OB)
    EK.push(EA, EB)
    console.log(
      `Iteration ${i}: OA = ${OA.toString(16)}, OB = ${OB.toString(
        16,
      )}, EA = ${EA.toString(16)}, EB = ${EB.toString(16)}`,
    )
  }

  // Объединение OK и EK в строки по 512 бит
  const OKString = OK.map((num) => num.toString(16).padStart(16, '0')).join('')
  const EKString = EK.map((num) => num.toString(16).padStart(16, '0')).join('')
  console.log('OK', OK)
  console.log('EK', EK)
  console.log('OKString: ', OKString)
  console.log('EKString: ', EKString)
  let KCurrent = K0
  let keys = [KCurrent]
  let counterOK = 0
  let counterEK = 0

  console.log('=== Starting rounds Keys ===')
  for (let i = 1; i <= 8; i++) {
    // На нечетные шаги используем Kt1, на четные - Kt2

    if (i % 2 === 1) {
      // Нечетные шаги (i = 1, 3, 5, 7)
      console.log(`Old Keys:${keys[i - 1]}`)
      const { left: L, right: R } = splitMessage(hexToBigInt(keys[i - 1]))

      KCurrent = roundEncryption(L, R, OK[counterOK], true) // Используем предыдущий ключ из массива keys
      counterOK++
    } else {
      // Четные шаги (i = 2, 4, 6, 8)
      console.log(`Old Keys:${keys[i - 1]}`)
      const { left: L, right: R } = splitMessage(hexToBigInt(keys[i - 1]))
      KCurrent = roundEncryption(L, R, EK[counterEK], true) // Используем предыдущий ключ из массива keys
      counterEK++
    }
    const hexResultKCurrent = bigIntToHex(KCurrent, 16)
    console.log(`New Keys: ${hexResultKCurrent}`)
    keys.push(hexResultKCurrent) // Добавляем новый ключ в массив keys
  }
  keys.shift()
  let numberBlock = localStorage.getItem('numberBlock')
  console.log(`Full keys in localStorage: ${keys}`)
  localStorage.setItem(`myArray${numberBlock}`, JSON.stringify(keys))
  console.log(`Number gemeration ${numberBlock}`)
  numberBlock = Number(numberBlock) + 1
  localStorage.setItem('numberBlock', numberBlock)

  return { Keys: keys }
}

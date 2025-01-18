import { KC, KD, RTTable } from '@/constants/constants'

const MOD64 = 2n ** 64n
const MOD64_PLUS_13 = MOD64 + 13n

// Функция RT для выполнения замены по таблице
function RT(input) {
  return RTTable[Number(input)]
}

// Функция для разделения ключа на две части по 64 бита
function splitKey(Key) {
  console.log(Key)
  const left = Key >> 64n // Левая половина
  const right = Key & 0xffffffffffffffffn // Правая половина
  console.log(`Split Key: Ai=${left.toString(16)}, Bi=${right.toString(16)}`)
  return { left, right }
}

export function roundEncryption(L, R, key, odd) {
  const { left: Ai, right: Bi } = splitKey(key)

  const Z = ((Ai * L + Bi) % MOD64_PLUS_13) % MOD64
  console.log(`Computed Z: ${Z.toString(16)}`)

  // Разделяем Z на две части по 32 бита
  const Zl = Z >> 32n // Старшие 32 бита
  const Zr = Z & 0xffffffffn // Младшие 32 бита
  console.log(`Split Z: Zl=${Zl.toString(16)}, Zr=${Zr.toString(16)}`)

  // Транскрипция Zl для S-блока
  const truncatedZl = Zl & 0x3fn // Обрезаем до 6 младших бит
  console.log(`Truncated Zl for RT: ${truncatedZl.toString(16)}`)

  // Применяем S-блок RT
  const RTResult = RT(truncatedZl)
  console.log(RTResult)
  console.log(`RT Table Output for ${truncatedZl}: ${RTResult.toString(16)}`)

  // Вычисляем результат Y
  const Yl = (Zr ^ BigInt(RTResult)) << 32n // Левые 32 бита результата
  const Yr = ((Zl ^ KC) + (KD % MOD64)) & 0xffffffffn // Правые 32 бита результата
  console.log(`Yl: ${Yl.toString(16)}, Yr: ${Yr.toString(16)}`)

  // Объединяем Y
  const Y = Yl | Yr
  console.log(`Combined Y: ${Y.toString(16)}`)

  // Финальный результат (шифрование)
  if (odd) {
    const finalResult = ((Y ^ R) << 64n) | L
    console.log(`Final Combined Result (hex): ${finalResult.toString(16)}`)
    return finalResult
  } else {
    const finalResult = L | ((Y ^ R) << 64n)
    console.log(`Final Combined Result (hex): ${finalResult.toString(16)}`)
    return finalResult
  }
}

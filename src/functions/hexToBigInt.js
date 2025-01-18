export function hexToBigInt(hex) {
  const cleanedHex = hex.trim().toLowerCase()
  if (!/^([0-9a-f]+)$/i.test(cleanedHex)) {
    throw new Error(`Неверный формат: "${hex}". Ожидается 16-ричное число.`)
  }
  return BigInt('0x' + cleanedHex)
}

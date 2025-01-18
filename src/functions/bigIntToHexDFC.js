// Функция для преобразования BigInt в hex строку
export function bigIntToHex(value, length = 16) {
  return value.toString(16).padStart(length, '0')
}

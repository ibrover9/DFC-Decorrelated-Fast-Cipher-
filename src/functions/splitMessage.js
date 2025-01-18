export function splitMessage(X) {
  const left = X >> 64n // Левые 64 бита
  const right = X & 0xffffffffffffffffn // Правые 64 бита
  return { left, right }
}

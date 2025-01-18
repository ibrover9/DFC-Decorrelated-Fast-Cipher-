export function splitMessage(X) {
  const left = X >> 64n // Левые 64 бита
  const right = X & 0xffffffffffffffffn // Правые 64 бита
  console.log(left)
  console.log(`Split Message: L=${left.toString(16)}, R=${right.toString(16)}`)
  return { left, right }
}

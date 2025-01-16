<style lang="scss">
.clear {
  width: 100%;

  display: flex;
  justify-content: right;
  &-defaultButton {
    margin-left: 1%;
  }
}

.main {
  background-color: rgb(233, 233, 233);
  margin-top: 2%;
  padding: 1%;
  border-radius: 1em;
}
</style>

<template>
  <div class="clear">
    <button class="clear-defaultButton" @click="clearKeys()">Clear Keys</button>
    <button class="clear-defaultButton" @click="clearBlocks()">Clear Blocks</button>
  </div>

  <div class="main">
    <h1>Generation Key</h1>
    <label for="PK">PK (256-bit):</label>
    <input
      type="text"
      id="PK"
      placeholder="1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF"
    />
    <button @click="generationKeys()">Run Generation Keys</button>

    <h1>DFC Algorithm Simulation 5 Blocks</h1>

    <label for="Blocks">Input 5 Blocks (640-bit hex) for Encryption:</label>
    <input
      type="text"
      id="Blocks"
      placeholder="2ED5F84F4A894462C7B7DD00E425E23DD44D19C33E89A968B12708CC2D2B8EE47F099845DCE12502710A6DDFCCC6B1A18155522AD1D8B058BA2ADF9D2C191E813F3ACA49CDACCDC7911412E58A4F215A


      "
    />
    <button @click="fiveBlocksDFC()">Run</button>
    <h1>DFC Algorithm Simulation 5 Blocks Decryption</h1>

    <label for="BlocksD">Input 5 Blocks (640-bit hex) for Decryption:</label>
    <input
      type="text"
      id="BlocksD"
      placeholder="b26cd197d53e868fb887d17531c4f372d45525c1227d880b601d350766c8bb4b680cd446463550a635b194097e7d214753f7f1cbba16b569043a622acada8ec95771020bcde051644c174fe0e86fcbb3
      "
    />
    <button @click="fiveBlocksDFCDecryption()">Run</button>

    <div id="output"></div>
  </div>
</template>

<script lang="js" setup>
import { KS, KC, KD, KA, KB, RTTable } from '@/constants/constants'

const MOD64 = 2n ** 64n
const MOD64_PLUS_13 = MOD64 + 13n

// Пример использования этих значений в функции
function processKey(K) {
  let K0 = '11111111111111111111111111111111'
  console.log('Initial Key (K): ', K)

  // Шаг 1: Переводим в BigInt
  let fullKey = BigInt('0x' + K)
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

function generationKeys() {
  console.log('=== Starting generation Keys ===')
  const PK = document.getElementById('PK').value
  if (PK.length !== 64) {
    alert('PK must be 256 bits (64 hex characters).')
    return
  }
  const result = processKey(PK)
  document.getElementById('output').innerText = `Keys: ${result.Keys}`
}

// Функция для разделения 128-битного числа на две части по 64 бита
function splitMessage(X) {
  const left = X >> 64n // Левые 64 бита
  const right = X & 0xffffffffffffffffn // Правые 64 бита
  console.log(left)
  console.log(`Split Message: L=${left.toString(16)}, R=${right.toString(16)}`)
  return { left, right }
}

// Функция для разделения ключа на две части по 64 бита
function splitKey(Key) {
  console.log(Key)
  const left = Key >> 64n // Левая половина
  const right = Key & 0xffffffffffffffffn // Правая половина
  console.log(`Split Key: Ai=${left.toString(16)}, Bi=${right.toString(16)}`)
  return { left, right }
}

function roundEncryption(L, R, key, odd) {
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

function roundDecryption(R, L, key, odd) {
  const { left: Ai, right: Bi } = splitKey(key)

  // Шаг 1: Вычисляем Z
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
  console.log(`RT Table Output for ${truncatedZl}: ${RTResult.toString(16)}`)

  // Вычисляем результат Y для расшифрования
  const Yl = (Zr ^ BigInt(RTResult)) << 32n // Левые 32 бита результата
  const Yr = ((Zl ^ KC) + (KD % MOD64)) & 0xffffffffn // Правые 32 бита результата
  console.log(`Yl: ${Yl.toString(16)}, Yr: ${Yr.toString(16)}`)

  // Объединяем Y
  const Y = Yl | Yr
  console.log(`Combined Y: ${Y.toString(16)}`)

  // Финальный результат (шифрование)
  if (odd) {
    const finalResult = (Y ^ R) | (L << 64n)
    console.log(`Final Combined Result (hex):112 ${finalResult.toString(16)}`)
    return finalResult
  } else {
    const finalResult = L | ((Y ^ R) << 64n)
    console.log(`Final Combined Result (hex): ${finalResult.toString(16)}`)
    return finalResult
  }
}

function performEncryptionDouble(X) {
  try {
    console.log('=== Starting DFC Round (Encrypt) ===')

    // Получаем значения X и Key для шифрования

    // const Key = hexToBigInt(document.getElementById("Key").value);
    let numberBlock = Number(localStorage.getItem('numberBlock2'))
    console.log(numberBlock)
    const sourceKey = `myArray${numberBlock}`
    console.log(sourceKey)
    const rawKeysLocalStorage = JSON.parse(localStorage.getItem(sourceKey))
    console.log(rawKeysLocalStorage)
    const KeysInBigInt = rawKeysLocalStorage.map(hexToBigInt)
    console.log(KeysInBigInt)
    console.log(`Input X (hex): ${X.toString(16)}`)

    let roundsArray = []

    for (let i = 0; i <= 7; i++) {
      // Берем текущий ключ из массива
      console.log(KeysInBigInt[i])

      const { left: L, right: R } = splitMessage(X)

      let roundCurrent = roundEncryption(L, R, KeysInBigInt[i], true)

      roundsArray.push(roundCurrent)
      X = roundCurrent
      console.log(X)
      console.log(roundsArray)
    }
    const RondsInHex = roundsArray.map(bigIntToHex)
    console.log(RondsInHex)

    numberBlock = Number(numberBlock) + 1
    localStorage.setItem('numberBlock2', numberBlock)

    return RondsInHex[RondsInHex.length - 1]
  } catch (error) {
    document.getElementById('output').textContent = `Ошибка: ${error.message}`
    console.error(error)
  }
}

function performDecryptionDouble(X) {
  try {
    console.log('=== Starting DFC Round (Decryption) ===')
    let numberBlock = Number(localStorage.getItem('numberBlock'))
    if (numberBlock == 6) {
      numberBlock = numberBlock - 1
    }
    console.log(numberBlock)
    const sourceKey = `myArray${numberBlock}`
    console.log(sourceKey)
    const rawKeysLocalStorage = JSON.parse(localStorage.getItem(sourceKey))
    console.log(rawKeysLocalStorage)
    const KeysInBigInt = rawKeysLocalStorage.map(hexToBigInt)
    console.log(KeysInBigInt)
    console.log(`Input X (hex): ${X.toString(16)}`)

    let roundsArray = []

    for (let i = 0; i <= 7; i++) {
      // Берем текущий ключ из массива
      console.log(KeysInBigInt[7 - i])

      const { left: L, right: R } = splitMessage(X)

      let roundCurrent = roundDecryption(L, R, KeysInBigInt[7 - i], true)

      roundsArray.push(roundCurrent)
      X = roundCurrent
      console.log(X)
      console.log(roundsArray)
    }
    const RondsInHex = roundsArray.map(bigIntToHex)
    console.log(RondsInHex)

    numberBlock = Number(numberBlock) - 1
    localStorage.setItem('numberBlock', numberBlock)
    const reversedRondsInHex = RondsInHex.reverse()
    const outputText = reversedRondsInHex.join('\n')
    document.getElementById('output').textContent = `Output (Decrypted):\n${outputText}`
    return RondsInHex[RondsInHex.length - 1]
  } catch (error) {
    document.getElementById('output').textContent = `Ошибка: ${error.message}`
    console.error(error)
  }
}

// Функция для преобразования hex строки в BigInt
function hexToBigInt(hex) {
  const cleanedHex = hex.trim().toLowerCase()
  if (!/^([0-9a-f]+)$/i.test(cleanedHex)) {
    throw new Error(`Неверный формат: "${hex}". Ожидается 16-ричное число.`)
  }
  return BigInt('0x' + cleanedHex)
}

// Функция для преобразования BigInt в hex строку
function bigIntToHex(value, length = 16) {
  return value.toString(16).padStart(length, '0')
}

// Функция RT для выполнения замены по таблице
function RT(input) {
  return RTTable[Number(input)]
}

function clearKeys() {
  const start = 1 // Начиная с myArray2
  const end = 100 // Заканчивая myArray100

  // Удаляем элементы из Local Storage
  for (let i = start; i <= end; i++) {
    localStorage.removeItem(`myArray${i}`)
  }
  localStorage.setItem('numberBlock', '1')
}

function clearBlocks() {
  localStorage.setItem('numberBlock2', '1')
}

function fiveBlocksDFC() {
  const RandomFirstClutch = hexToBigInt('b2d3a3fae88b54447b295c7c00e5b9ff')
  const chunkSize = 32
  let fiveBlocks = document.getElementById('Blocks').value
  console.log(`Big block 160 in 16(hex):${fiveBlocks}`)
  console.log(`Length: ${fiveBlocks.length}`)
  let chunks = []
  for (let i = 0; i < fiveBlocks.length; i += chunkSize) {
    chunks.push(fiveBlocks.slice(i, i + chunkSize))
  }
  console.log(`Five blocks 32 in 16(hex): ${chunks}`)

  const hexChunks = chunks.map(hexToBigInt)
  console.log(`Five blocks 32 BigInt: ${hexChunks}`)
  let blocksNew = []
  for (let i = 0; i < hexChunks.length; i++) {
    if (i == 0) {
      const curentBlock = performEncryptionDouble(hexChunks[i])
      blocksNew.push(curentBlock)
    } else {
      const curentBlock = performEncryptionDouble(hexChunks[i])
      blocksNew.push(curentBlock)
    }
  }
  console.log(`Five new blocks: ${blocksNew}`)
  const outputText = blocksNew.join('\n')
  document.getElementById('output').textContent = `Output (Encrypted):\n${outputText}`
  let newRezultFull = blocksNew.join('')
  console.log(`New bif block: ${newRezultFull}`)
}

function fiveBlocksDFCDecryption() {
  const RandomFirstClutch = hexToBigInt('53f7f1cbba16b569043a622acada8ec9')
  const chunkSize = 32
  let fiveBlocks = document.getElementById('BlocksD').value
  console.log(`Big block 160 in 16(hex):${fiveBlocks}`)
  console.log(`Length: ${fiveBlocks.length}`)
  let chunks = []

  for (let i = fiveBlocks.length; i > 0; i -= chunkSize) {
    chunks.push(fiveBlocks.slice(Math.max(i - chunkSize, 0), i))
  }
  console.log(`Five blocks 32 in 16(hex): ${chunks}`)

  const hexChunks = chunks.map(hexToBigInt)
  console.log(`Five blocks 32 BigInt: ${hexChunks}`)
  let blocksNew = []
  for (let i = 0; i < hexChunks.length; i++) {
    if (i == 0) {
      const curentBlock = performDecryptionDouble(hexChunks[i])
      console.log(RandomFirstClutch)
      console.log(curentBlock)
      blocksNew.unshift(hexToBigInt(curentBlock))
    } else {
      const curentBlock = performDecryptionDouble(hexChunks[i])
      console.log(curentBlock)
      blocksNew.unshift(hexToBigInt(curentBlock))

      console.log(curentBlock)
    }
  }
  blocksNew = blocksNew.map(bigIntToHex)
  console.log(`Five new blocks: ${blocksNew}`)
  let newRezultFull = blocksNew.join('')
  console.log(`New bif block: ${newRezultFull}`)
}
</script>

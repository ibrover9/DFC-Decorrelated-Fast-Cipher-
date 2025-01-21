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

.allKeys {
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
  &-arrayKeys {
    width: 29.3%;
    background-color: rgb(185, 185, 185);
    padding: 2%;
    display: flex;

    &-optionButttons {
      height: 100%;
      button {
        margin: 10%;
        height: 20%;
      }
    }
  }
}

@media (max-width: 1400px) {
  .allKeys {
    &-arrayKeys {
      width: 45.3%;
      &-optionButttons {
        button {
        }
      }
    }
  }
}
@media (max-width: 1000px) {
  .allKeys {
    &-arrayKeys {
      width: 98.3%;
      &-main {
        width: 80%;
      }
      &-optionButttons {
        button {
          margin-right: 20%;
        }
      }
    }
  }
}

@media (max-width: 600px) {
  .allKeys {
    font-size: 12px;

    justify-content: center;
    &-arrayKeys {
      width: 98.3%;
      display: block;
      &-main {
        width: 100%;
      }
      &-optionButttons {
        width: 30%;
        height: 100%;
        display: flex;
        button {
          height: 20%;
          margin-right: 1%;
          padding: 5%;
        }
      }
    }
  }
}
@media (max-width: 550px) {
  .allKeys {
    font-size: 12px;

    justify-content: center;
    &-arrayKeys {
      width: 98.3%;
      display: block;
      &-main {
        width: 100%;
      }
      &-optionButttons {
        width: 30%;
        height: 100%;
        display: flex;
        button {
          height: 15%;
          margin-right: 1%;
          padding: 5%;
        }
      }
    }
  }
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
    <input type="text" id="PK" v-model="PK" :placeholder="EXAMPLEKEY" />
    <button @click="generationKeys()">Run Generation Keys</button>

    <h1>DFC Algorithm Simulation 5 Blocks</h1>

    <label for="Blocks">Input 5 Blocks (640-bit hex) for Encryption:</label>
    <input type="text" id="Blocks" :placeholder="ENCRYPTION5BLOCKS" />
    <button @click="fiveBlocksDFC()">Run</button>
    <h1>DFC Algorithm Simulation 5 Blocks Decryption</h1>

    <label for="BlocksD">Input 5 Blocks (640-bit hex) for Decryption:</label>
    <input type="text" id="BlocksD" :placeholder="DECRYPTION5BLOCKS" />
    <button @click="fiveBlocksDFCDecryption()">Run</button>

    <div id="output">{{ resultDFC }}</div>
    <div class="allKeys">
      <div class="allKeys-arrayKeys" v-for="(item, index) in arraysKey" :key="index">
        <div class="allKeys-arrayKeys-main">{{ index + 1 }}: {{ item }}</div>

        <div class="allKeys-arrayKeys-optionButttons">
          <button>{{ index + 1 }}</button>
          <button class="primary">UPDATE</button>
          <button class="important">DELETE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="js" setup>
import { ref, reactive } from 'vue'
import { KC, KD, RTTable } from '@/constants/constants'
import { ENCRYPTION5BLOCKS, DECRYPTION5BLOCKS, EXAMPLEKEY } from '@/constants/placeholder'
import { createNewKeysDFC } from '@/functions/createNewKeysDFC'
import { hexToBigInt } from '@/functions/hexToBigInt'
import { bigIntToHex } from '@/functions/bigIntToHexDFC'
import { roundEncryption } from '@/functions/roundEncryptionDFC'
const PK = ref('')
const resultDFC = ref('значение по умолчанию ^-^')
const arraysKey = reactive([])
const MOD64 = 2n ** 64n
const MOD64_PLUS_13 = MOD64 + 13n

function generationKeys() {
  const result = createNewKeysDFC(PK.value)
  resultDFC.value = result
  arraysKey.push(result)
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
  arraysKey.splice(0, this.arraysKey.length)
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

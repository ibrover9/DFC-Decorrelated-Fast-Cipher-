# dfs2025

Данная работа будет дорабатываться и была изначально выполнена для курсовой за 2 дня. 22.06.2025 перенес проект на vue, в планах довести его до ума если будет позволять время. Шифр очень сильно заинтересовал и поэтому буду трудиться и выпускать апдэйты.

## Что сейчас сделано

В данный момент можно работать только в 16-ричной системе счисления и шифровать сообщения длиной ровно 5 блоков. Заранее нужно подготовить ключи для этого: Введите ключ в 16-ричной системе счисления и нажмите на кнопку "Run Generation Keys". Такую процедуру нужно провести 5 раз. Далее вводим сообщение в 16-ричной системе счисления, ровно по длине 5 блоков — не больше и не меньше. Получаем зашифрованное сообщение, далее это же зашифрованное сообщение вводим в поле расшифровки. Рекомендую смотреть все по консоль логам, пока что так проще.

## Что будет добавлено

1. Работа с любым количеством блоков.

## Что будет изменено

1. Связь между ключами и блоками не будет костылем.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,

  // Добавление правила для поддержки обоих типов <script> и настройки для других блоков
  {
    rules: {
      'vue/block-lang': [
        'error',
        {
          script: ['js', 'ts'], // Поддержка обоих типов: JS и TS
          style: 'scss', // или другой препроцессор CSS, если требуется
          template: 'pug', // или другой шаблонизатор
        },
      ],
    },
  },
]

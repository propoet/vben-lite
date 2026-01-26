import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue,js,jsx,cjs,mjs}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  // rules 必须放在对象中,否则会报错
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      // 允许使用下划线前缀表示未使用的变量
      // 例如：const [_key, value] = entries 表示 key 是故意不使用的
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // 函数参数：允许 _param 或 _ 开头的参数
          argsIgnorePattern: '^_',
          // 变量：允许 _variable 或 _ 开头的变量
          varsIgnorePattern: '^_',
          // catch 错误：允许 _error 或 _ 开头的错误变量
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
)

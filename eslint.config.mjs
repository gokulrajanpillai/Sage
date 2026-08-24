import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  module: 'readonly',
  require: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly'
}

export default tseslint.config(
  {
    ignores: ['out/**', 'dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['*.config.{js,mjs,cjs,ts}', 'scripts/**/*.mjs', 'src/main/**/*.ts', 'src/preload/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: nodeGlobals
    }
  },
  {
    files: ['src/renderer/**/*.tsx'],
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules
    }
  }
)

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // Solo se registra el plugin para activar jsx-uses-vars (marca como usadas las
    // variables/componentes referenciados en JSX). NO se aplica la config recomendada
    // de react para no introducir reglas nuevas.
    plugins: {
      react,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // Evita falsos positivos de no-unused-vars con componentes usados solo en JSX
      // (p. ej. el `icon: Icon` destructurado y renderizado como <Icon/>).
      'react/jsx-uses-vars': 'error',
    },
  },
])

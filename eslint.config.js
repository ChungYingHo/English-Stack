import astro from 'eslint-plugin-astro'
import svelte from 'eslint-plugin-svelte'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import svelteParser from 'svelte-eslint-parser'
import importPlugin from 'eslint-plugin-import'

// 專案共用的程式風格規則 (套用於 JS/TS 與 Svelte)
const styleRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
  semi: ['error', 'never'],
  eqeqeq: ['error', 'always'],
  'no-var': 'error',
  'prefer-const': 'error',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-restricted-imports': ['error', { patterns: ['../*', './*'] }],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      prefer: 'type-imports',
      disallowTypeAnnotations: false,
      fixStyle: 'inline-type-imports',
    },
  ],
}

export default [
  // 全域忽略 (建置產物、相依套件、生成型別、課程素材)
  {
    ignores: [
      'dist/**',
      '.vercel/**',
      '.astro/**',
      'node_modules/**',
      'course_files/**',
      'public/pagefind/**',
    ],
  },

  ...astro.configs.recommended,
  ...svelte.configs.recommended,

  {
    files: ['**/*.{js,ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      ...styleRules,
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'no-useless-return': 'warn',
      'no-else-return': 'warn',
      'no-unexpected-multiline': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/no-relative-parent-imports': 'error',
      'import/no-relative-packages': 'error',
    },
  },

  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...styleRules,
    },
  },

  {
    files: ['**/*.astro'],
    rules: {
      'no-console': 'off',
    },
  },
]

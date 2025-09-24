// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-config-prettier'
import tailwind from 'eslint-plugin-tailwindcss'
import unusedImports from 'eslint-plugin-unused-imports'

export default withNuxt([
    prettier,
    {
        files: ['~/app/**/*.{js,ts,vue}'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue']
            }
        },
        plugins: {
            'vue': vuePlugin,
            'tailwindcss': tailwind,
            'unused-imports': unusedImports,
            '@typescript-eslint': ts
        },
        rules: {
            /* --- Main --- */
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

            /* --- Vue --- */
            'vue/multi-word-component-names': 'off',
            'vue/no-v-html': 'off',

            /* --- TypeScript --- */
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',

            /* --- Auto-remove unused --- */
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_'
                }
            ],

            /* --- Tailwind --- */
            'tailwindcss/no-custom-classname': 'off'
        }
    },
    {
        ignores: [
            // prettier-ignore
            '.nuxt',
            '.output',
            '.nitro',
            'node_modules',
            'dist',
            'coverage',
            '.pnp.*'
        ]
    }
])

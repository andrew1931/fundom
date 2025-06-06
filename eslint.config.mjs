import globals from 'globals';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default [
   js.configs.recommended,
   {
      languageOptions: {
         ecmaVersion: 2022,
         sourceType: 'module',
         globals: {
            ...globals.browser,
            ...globals.node,
            define: 'readonly',
         },
         parser: tseslint.parser,
      },
      plugins: {
         'typescript-eslint': tseslint.plugin,
      },
      rules: {
         'no-undef': 'off',
         'no-unused-vars': 'off', // disable base unused vars, use TS version instead
         'typescript-eslint/no-unused-vars': 'warn',
         'prefer-const': 0
      }
   }
];

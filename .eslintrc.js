module.exports = {
   env: {
      browser: true,
      es2021: true,
   },
   parser: '@typescript-eslint/parser',
   plugins: ['@typescript-eslint'],
   extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
   overrides: [
      {
         env: {
            node: true,
         },
         files: ['.eslintrc.{js,cjs}'],
         parserOptions: {
            sourceType: 'script',
         },
      },
   ],
   parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
   },
   rules: {
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-unused-vars': 1,
      'prefer-const': 0,
   },
};

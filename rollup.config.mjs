import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import pkg from './package.json' assert { type: 'json' };

export default [
   {
      input: 'src/index.ts',
      output: {
         name: 'FD',
         file: pkg.browser,
         format: 'umd'
      },
      plugins: [
         esbuild({ tsconfig: './tsconfig.json' }),
         resolve(),
         commonjs()
      ]
   },
];
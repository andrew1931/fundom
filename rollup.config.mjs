import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { readdir, unlink } from 'fs/promises';
import { join } from 'path';

const outputDir = 'dist';
const name = 'FD';

function cleanupDtsFiles() {
   return {
      name: 'clean-dts',
      async writeBundle() {
         const entries = await readdir(outputDir, { withFileTypes: true });
         for (const entry of entries) {
            if (
               entry.isFile() &&
               entry.name.endsWith('.d.ts') &&
               entry.name !== 'index.d.ts'
            ) {
               const fullPath = join(outputDir, entry.name);
               await unlink(fullPath);
            }
         }
      }
   }
}

export default [
   {
      input: 'src/index.ts',
      output: [
         {
            name,
            file: `${outputDir}/index.iife.js`,
            format: 'iife',
            plugins: [terser()]
         },
         {
            name,
            file: `${outputDir}/index.umd.js`,
            format: 'umd',
            plugins: [terser()]
         },
         {
            name,
            file: `${outputDir}/index.esm.js`,
            format: 'es'
         },
      ],
      plugins: [
         typescript({ tsconfig: './tsconfig.json' }),
      ],
   },
   {
      input: `${outputDir}/index.d.ts`,
      output: [{
         file: `${outputDir}/index.d.ts`,
         format: 'es'
      }],
      plugins: [
         dts(),
         cleanupDtsFiles()
      ],
   }
];
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./guest-js/index.ts'],
  outDir: './dist-js',
  format: ['cjs', 'esm'],
  dts: true,
  minify: true
})
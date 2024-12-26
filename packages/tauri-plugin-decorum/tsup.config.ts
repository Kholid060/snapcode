import { readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { defineConfig } from 'tsup';;

const pkg = JSON.parse(readFileSync(join(cwd(), 'package.json'), 'utf8'))
const deps = [
  /^@tauri-apps\/api/,
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

export default defineConfig([
  {
    entry: ['guest-js/index.ts'],
    format: ['esm', 'cjs'],
    outDir: './dist-js',
    dts: true,
    external: deps,
  },
  {
    entry: ['./guest-js/titlebar.ts'],
    minify: true,
    treeshake: true,
    outDir: './src/js',
    format: ['esm'],
    noExternal: deps,
  }
]);

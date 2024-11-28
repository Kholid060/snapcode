import { readFileSync } from 'fs'
import { join } from 'path'
import { cwd } from 'process'
import { defineConfig } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript'

const pkg = JSON.parse(readFileSync(join(cwd(), 'package.json'), 'utf8'))

export default defineConfig([
  {
    input: 'guest-js/index.ts',
    output: [
      {
        file: pkg.exports.import,
        format: 'esm'
      },
      {
        file: pkg.exports.require,
        format: 'cjs'
      }
    ],
    plugins: [
      typescript({
        declaration: true,
        declarationDir: `./${pkg.exports.import.split('/')[0]}`
      })
    ],
    external: [
      /^@tauri-apps\/api/,
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]
  },
  {
    input: './guest-js/titlebar.ts',
    output: './src/js/titlebar.js',
    plugins: [typescript(), nodeResolve()],
    treeshake: true,
  }
]);

import { defineConfig } from 'tsdown'

const external = [/^@deepseek-ai\//, 'react', 'react/jsx-runtime']

export default defineConfig([
  {
    name: 'host',
    entry: ['src/index.ts'],
    platform: 'node',
    target: 'node22',
    format: 'esm',
    outDir: 'lib',
    sourcemap: true,
    dts: false,
    clean: false,
    deps: { neverBundle: external },
    outputOptions: {
      entryFileNames: 'index.js',
    },
  },
  {
    name: 'client',
    entry: ['src/client/index.tsx'],
    platform: 'browser',
    target: 'es2022',
    format: 'cjs',
    outDir: 'lib',
    sourcemap: true,
    dts: false,
    clean: false,
    deps: { neverBundle: external },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: 'window.__ModuleLoader__.load({ id: "dsh-statusbar-config", factory: (require) => {',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      footer: 'return module.exports; } });',
    },
  },
])

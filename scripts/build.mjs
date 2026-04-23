/**
 * Custom build script for Chrome Extension
 *
 * Build order:
 * 1. bootstrap.ts → Polyfill for process (runs first)
 * 2. content-script.ts → IIFE (script clásico, tiene acceso a customElements)
 * 3. background.ts → ES module (service worker)
 * 4. Copy manifest.json to dist
 */

import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = resolve(ROOT, 'dist')

// Ensure dist exists
if (!existsSync(DIST)) {
  mkdirSync(DIST, { recursive: true })
}

async function buildBootstrap() {
  console.log('Building bootstrap (polyfill)...')

  await build({
    configFile: false,
    build: {
      lib: {
        entry: resolve(ROOT, 'src/bootstrap.ts'),
        name: 'EventInspectorBootstrap',
        fileName: () => 'bootstrap.js',
        formats: ['iife'],
      },
      outDir: DIST,
      emptyOutDir: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })

  console.log('✓ bootstrap.js built')
}

async function buildContentScript() {
  console.log('Building content-script (IIFE)...')

  await build({
    configFile: false,
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(ROOT, 'src/presentation/entry/content-script.tsx'),
        name: 'EventInspector',
        fileName: () => 'content-script.js',
        formats: ['iife'],
      },
      outDir: DIST,
      emptyOutDir: false,
      // Bundle everything - no external deps for content script
      rollupOptions: {
        output: {
          // IIFE format - single self-contained file
          inlineDynamicImports: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(ROOT, 'src'),
      },
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })

  console.log('✓ content-script.js built')
}

async function buildBackground() {
  console.log('Building background (ES module)...')
  
  await build({
    configFile: false,
    build: {
      outDir: DIST,
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(ROOT, 'src/background.ts'),
        output: {
          entryFileNames: '[name].js',
          format: 'es',
        },
      },
    },
  })
  
  console.log('✓ background.js built')
}

function copyManifest() {
  const manifestSrc = resolve(ROOT, 'manifest.json')
  const manifestDest = resolve(DIST, 'manifest.json')
  copyFileSync(manifestSrc, manifestDest)
  console.log('✓ manifest.json copied')
}

async function main() {
  console.log('\n📦 Event Inspector - Build\n')

  try {
    await buildBootstrap()
    await buildContentScript()
    await buildBackground()
    copyManifest()

    console.log('\n✅ Build complete!\n')
  } catch (error) {
    console.error('\n❌ Build failed:', error)
    process.exit(1)
  }
}

main()
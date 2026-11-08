import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * FORMA Vite config
 * - Scoped file watch (avoid F:\\DumpStack.log.tmp / system paths)
 * - Electron main/preload via vite-plugin-electron/simple
 * - better-sqlite3 external (native)
 */
export default defineConfig({
  root: rootDir,
  publicDir: 'public',
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            emptyOutDir: true,
            rollupOptions: {
              external: [
                'better-sqlite3',
                'electron',
                'path',
                'fs',
                'os',
                'url',
                'util',
                'child_process',
                'crypto',
              ],
            },
          },
        },
      },
      preload: {
        input: 'electron/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            emptyOutDir: true,
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [rootDir],
      strict: true,
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/dist-electron/**',
        '**/release/**',
        '**/.git/**',
        '**/DumpStack.log.tmp',
        '**/pagefile.sys',
        '**/hiberfil.sys',
        '**/swapfile.sys',
        '**/System Volume Information/**',
        '**/$Recycle.Bin/**',
        'F:/**',
      ],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  clearScreen: false,
});

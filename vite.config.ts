import type { UserConfig } from 'vite';
import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import zipPack from 'vite-plugin-zip-pack';
import manifest from './src/manifest';

const RELEASE_NAME = 'copyable';
const PORT = 5173;

export default {
  root: 'src',
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
  },
  // To work HMR
  server: {
    strictPort: true,
    port: PORT,
    hmr: {
      clientPort: PORT,
    },
  },
  plugins: [
    crx({
      manifest,
    }),
    zipPack({
      outDir: 'releases',
      outFileName: `${RELEASE_NAME}-v${manifest.version}.zip`,
      filter: (fileName) => fileName !== '.vite',
    }),
  ],
} satisfies UserConfig;

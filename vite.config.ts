import type { UserConfig } from 'vite';
import path from 'node:path';
import process from 'node:process';
import webExtension from 'vite-plugin-web-extension';
import zipPack from 'vite-plugin-zip-pack';
import createManifest from './src/create-manifest';

const RELEASE_NAME = 'copyable';

const browser = process.env.BROWSER || 'chrome';

if (browser !== 'chrome' && browser !== 'firefox') {
  throw new TypeError('BROWSER is not valid.');
}

const outDir = path.resolve(import.meta.dirname, 'dist', browser);
const manifest = createManifest(browser);

export default {
  root: 'src',
  build: {
    outDir,
    emptyOutDir: true,
  },
  plugins: [
    webExtension({
      manifest: () => manifest,
      browser,
      additionalInputs: [
        'content-isolated',
        'content-main',
        'error-window/index.html',
      ],
    }),
    zipPack({
      inDir: outDir,
      outDir: 'releases',
      outFileName: `${RELEASE_NAME}-${browser}-v${manifest.version}.zip`,
      filter: (fileName) => fileName !== '.vite',
    }),
  ],
} satisfies UserConfig;

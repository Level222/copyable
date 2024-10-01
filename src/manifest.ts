import type { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest = {
  manifest_version: 3,
  name: 'Copyable',
  version: '1.0.0',
  description: 'Browser extension to unblock copying of web pages',
} satisfies ManifestV3Export;

export default manifest;

import type { Manifest } from 'webextension-polyfill';

const createManifest = (browser: 'chrome' | 'firefox') => {
  const manifest = {
    manifest_version: 3,
    name: 'Copyable',
    version: '1.0.0',
    description: 'Browser extension to unblock copying of web pages',
    permissions: [
      'scripting',
      'storage',
      'tabs',
    ],
    host_permissions: ['<all_urls>'],
    options_ui: {
      page: 'options-ui/index.html',
    },
    background: browser === 'firefox'
      ? { scripts: ['background/index.ts'] }
      : { service_worker: 'background/index.ts' },
    ...browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              id: '{a7574bcb-86a3-4f59-b893-95b08dde048f}',
            },
          },
        }
      : {},
  } as const satisfies Manifest.WebExtensionManifest;

  return manifest;
};

export default createManifest;

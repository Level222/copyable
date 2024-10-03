import type { UpdateCSSMessage } from '../types';
import dedent from 'dedent';
import browser from 'webextension-polyfill';
import defaultStorage from '../default-storage';
import { ConfigStorage, RuntimeMessage, SyncStorage } from '../types';

const CONTENT_SCRIPTS: browser.Scripting.RegisteredContentScript[] = [
  {
    id: 'CONTENT_ISOLATED',
    js: ['content-isolated.js'],
    runAt: 'document_start',
  },
  {
    id: 'CONTENT_MAIN',
    js: ['content-main.js'],
    runAt: 'document_start',
    world: 'MAIN',
  },
];

const updateContentScripts = async (patterns: string[]) => {
  const registeredScripts = await browser.scripting.getRegisteredContentScripts({
    ids: CONTENT_SCRIPTS.map(({ id }) => id),
  });

  const registeredScriptIds = registeredScripts.map(({ id }) => id);

  if (patterns.length === 0) {
    await browser.scripting.unregisterContentScripts({ ids: registeredScriptIds });
    return;
  }

  const unregisteredScripts = CONTENT_SCRIPTS.filter(
    ({ id }) => !registeredScriptIds.includes(id),
  );

  try {
    await Promise.all([
      browser.scripting.updateContentScripts(registeredScriptIds.map((id) => ({
        id,
        matches: patterns,
      }))),

      browser.scripting.registerContentScripts(unregisteredScripts.map((script) => ({
        ...script,
        matches: patterns,
      }))),
    ]);
  } catch (error) {
    const errorWindowURL = new URL(browser.runtime.getURL('error-window/index.html'));
    errorWindowURL.searchParams.set('error', dedent`
      An error has occurred while updating content scripts.
      ${error}

      Edit the “patterns” property on the options page to correct this error.
    `);

    browser.windows.create({
      url: String(errorWindowURL),
      type: 'popup',
      width: 300,
      height: 200,
    });
  }
};

browser.runtime.onInstalled.addListener(async () => {
  const unknownStorage = await browser.storage.sync.get();

  let storage = defaultStorage;

  try {
    storage = SyncStorage.parse(unknownStorage);
  } catch {
    browser.storage.sync.set(defaultStorage);
  }

  await updateContentScripts(storage.config.patterns);
});

type UpdateCSSOptions = Omit<UpdateCSSMessage, 'type'> & {
  tabId: number;
};

const updateCSS = ({ action, css, cssOrigin, tabId }: UpdateCSSOptions) => {
  const cssInjection: browser.Scripting.CSSInjection = {
    target: { tabId },
    css,
    origin: cssOrigin,
  };

  switch (action) {
    case 'INSERT':
      browser.scripting.insertCSS(cssInjection);
      break;

    case 'REMOVE':
      browser.scripting.removeCSS(cssInjection);
      break;
  }
};

browser.runtime.onMessage.addListener(async (unknownMessage, sender) => {
  const message = RuntimeMessage.parse(unknownMessage);

  switch (message.type) {
    case 'UPDATE_CSS':
      if (sender.tab?.id) {
        updateCSS({
          action: message.action,
          css: message.css,
          cssOrigin: message.cssOrigin,
          tabId: sender.tab.id,
        });
      }

      break;
  }
});

browser.storage.sync.onChanged.addListener((changes) => {
  if (!('config' in changes)) {
    return;
  }

  const config = ConfigStorage.parse(changes.config.newValue);
  updateContentScripts(config.patterns);
});

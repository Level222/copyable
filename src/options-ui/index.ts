import type { SyncStorage, SyncStoragePartial } from '../types';
import { assertValidPattern } from 'webext-patterns';
import browser from 'webextension-polyfill';
import { ConfigStorage } from '../types';
import './style.css';

const configTextarea = document.getElementById('config');
const errorArea = document.getElementById('error');
const saveButton = document.getElementById('save');

if (!(configTextarea instanceof HTMLTextAreaElement)) {
  throw new TypeError('Failed to find element #config.');
}

if (!errorArea) {
  throw new TypeError('Failed to find element #error.');
}

if (!saveButton) {
  throw new TypeError('Failed to find element #save.');
}

type ValidateResult =
  | {
    valid: true;
    config: ConfigStorage;
  }
  | {
    valid: false;
  };

const validateConfigTextareaAndUpdateError = (): ValidateResult => {
  let config: ConfigStorage;

  try {
    const unknownConfig = JSON.parse(configTextarea.value);
    config = ConfigStorage.parse(unknownConfig);

    for (const pattern of config.patterns) {
      assertValidPattern(pattern);
    }
  } catch (error) {
    errorArea.textContent = String(error);
    return { valid: false };
  }

  errorArea.replaceChildren();

  return { valid: true, config };
};

configTextarea.addEventListener('input', validateConfigTextareaAndUpdateError);

saveButton.addEventListener('click', () => {
  const validateResult = validateConfigTextareaAndUpdateError();

  if (validateResult.valid) {
    browser.storage.sync.set({
      config: validateResult.config,
    } satisfies SyncStoragePartial);
  }
});

const handleUpdateConfig = async () => {
  const { config: unknownConfig } = await browser.storage.sync.get('config' satisfies keyof SyncStorage);
  const config = ConfigStorage.parse(unknownConfig);

  configTextarea.value = JSON.stringify(config, null, 2);
};

handleUpdateConfig();

browser.storage.sync.onChanged.addListener((changes) => {
  if ('config' in changes) {
    handleUpdateConfig();
  }
});

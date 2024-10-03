import type { CopyableInitEventDetail, CopyableMessageEventDetail, RuntimeMessage, SyncStorage } from '../types';
import { patternToRegex } from 'webext-patterns';
import browser from 'webextension-polyfill';
import { ConfigStorage } from '../types';

const messageEventType = `__COPYABLE_${crypto.randomUUID()}__`;

const dispatchCopyableInitEvent = () => {
  window.dispatchEvent(new CustomEvent('__COPYABLE_INIT__', {
    // Use JSON to avoid Firefox errors
    detail: JSON.stringify({ messageEventType } satisfies CopyableInitEventDetail),
  }));
};

dispatchCopyableInitEvent();
window.addEventListener('__COPYABLE_LOAD_MAIN__', dispatchCopyableInitEvent);

let prevCSSConfig: Pick<ConfigStorage, 'css' | 'cssOrigin'> | undefined;

const handleChangeConfig = async () => {
  const { config: unknownConfig } = await browser.storage.sync.get('config' satisfies keyof SyncStorage);
  const { eventTypes, patterns, css, cssOrigin } = ConfigStorage.parse(unknownConfig);

  const enabled = patterns.some((pattern) => patternToRegex(pattern).test(location.href));

  window.dispatchEvent(new CustomEvent(messageEventType, {
    // Use JSON to avoid Firefox errors
    detail: JSON.stringify(
      {
        message: {
          type: 'UPDATE_EVENT_TYPES',
          eventTypes: enabled ? eventTypes : [],
        },
      } satisfies CopyableMessageEventDetail,
    ),
  }));

  if (prevCSSConfig !== undefined) {
    await browser.runtime.sendMessage({
      type: 'UPDATE_CSS',
      action: 'REMOVE',
      css: prevCSSConfig.css,
      cssOrigin: prevCSSConfig.cssOrigin,
    } satisfies RuntimeMessage);
  }

  if (enabled) {
    await browser.runtime.sendMessage({
      type: 'UPDATE_CSS',
      action: 'INSERT',
      css,
      cssOrigin,
    } satisfies RuntimeMessage);
  }

  prevCSSConfig = { css, cssOrigin };
};

handleChangeConfig();

browser.storage.sync.onChanged.addListener((changes) => {
  if ('config' in changes) {
    handleChangeConfig();
  }
});

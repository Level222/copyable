import type { SyncStorage } from '../types';
import css from './style.css?inline';

const defaultStorage: SyncStorage = {
  version: 1,
  config: {
    patterns: [],
    eventTypes: [
      'contextmenu',
      'copy',
      'cut',
      'mousedown',
      'mouseup',
      'pointerdown',
      'selectstart',
      'keydown',
      'keyup',
    ] satisfies (keyof GlobalEventHandlersEventMap)[],
    css,
    cssOrigin: 'USER',
  },
};

export default defaultStorage;

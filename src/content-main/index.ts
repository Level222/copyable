import { CopyableInitEventDetail, CopyableMessageEventDetail } from '../types';

let targetEventTypes: string[] = [];

Event.prototype.preventDefault = new Proxy(Event.prototype.preventDefault, {
  apply(target, thisArg, argArray) {
    if (thisArg instanceof Event && targetEventTypes.includes(thisArg.type)) {
      return;
    }

    return Reflect.apply(target, thisArg, argArray);
  },
});

/**
 * @example
 * [...getAllPrototypesOf(Element)] // [Element, Node, EventTarget, Function, Object]
 */
const getAllPrototypesOf = function* (obj: object | null) {
  let currentPrototype = obj;

  while (currentPrototype !== null) {
    yield currentPrototype;
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }
};

/**
 * @example
 * getSubtypeClasses(window, Node) // [Node, Element, HTMLElement, ...]
 */
const getSubtypeClasses = (globalObject: object, supertypeObject: { new(): unknown }) => (
  Object.values(Object.getOwnPropertyDescriptors(globalObject)).flatMap(({ value }) => {
    if (typeof value !== 'function') {
      return [];
    }

    for (const prototype of getAllPrototypesOf(value)) {
      if (prototype === supertypeObject) {
        return value.prototype;
      }
    }

    return [];
  })
);

const createEventHandlerProxy = (
  eventHandler: (ev: Event) => unknown,
  eventType: string,
) => (
  new Proxy(eventHandler, {
    apply(target, thisArg, argArray) {
      const returnedValue = Reflect.apply(target, thisArg, argArray);

      if (!targetEventTypes.includes(eventType)) {
        return returnedValue;
      }
    },
  })
);

const targetObjects = [...getSubtypeClasses(window, Node), window];

for (const targetObject of targetObjects) {
  const properties = Object.entries(Object.getOwnPropertyDescriptors(targetObject));

  const descriptors = Object.fromEntries(
    properties.flatMap(([key, { set: nativeSet }]) => {
      if (!nativeSet) {
        return [];
      }

      const match = key.match(/^on(.*)/);

      if (!match) {
        return [];
      }

      const [, eventType] = match;

      return [[key, {
        set: new Proxy(nativeSet, {
          apply(target, thisArg, argArray) {
            const [value] = argArray;
            const newValue = typeof value === 'function'
              ? createEventHandlerProxy(value, eventType)
              : value;

            return Reflect.apply(target, thisArg, argArray.with(0, newValue));
          },
        }),
      }]];
    }),
  );

  Object.defineProperties(targetObject, descriptors);
}

const handleAttributesChange = (element: Element, attributes: string[]) => {
  const nodePrototypes = [...getAllPrototypesOf(element)];

  for (const attribute of attributes) {
    if (!attribute.startsWith('on')) {
      continue;
    }

    for (const prototype of nodePrototypes) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, attribute);

      if (descriptor) {
        descriptor.set?.call?.(element, descriptor.get?.call?.(element));
        break;
      }
    }
  }
};

const observer = new MutationObserver((mutations) => {
  for (const { type, target, addedNodes, attributeName } of mutations) {
    switch (type) {
      case 'childList':
        for (const node of addedNodes) {
          if (node instanceof Element) {
            handleAttributesChange(node, [...new Set(node.getAttributeNames())]);
          }
        }

        break;

      case 'attributes':
        if (target instanceof Element && attributeName !== null) {
          handleAttributesChange(target, [attributeName]);
        }

        break;
    }
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
});

const handleMessage = (event: Event) => {
  if (!(event instanceof CustomEvent)) {
    return;
  }

  const { message } = CopyableMessageEventDetail.parse(JSON.parse(event.detail));

  switch (message.type) {
    case 'UPDATE_EVENT_TYPES':
      targetEventTypes = message.eventTypes;
      break;
  }
};

window.addEventListener('__COPYABLE_INIT__', (event) => {
  if (event instanceof CustomEvent) {
    const { messageEventType } = CopyableInitEventDetail.parse(JSON.parse(event.detail));
    window.addEventListener(messageEventType, handleMessage);
  }
});

window.dispatchEvent(new CustomEvent('__COPYABLE_LOAD_MAIN__'));

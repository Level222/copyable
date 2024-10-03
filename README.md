# Copyable

Browser extension to unblock copying of web pages

## Usage

It's simple. Open the options page and edit the `patterns` property.

Examples:

```diff
  {
    "patterns": [
+     "https://example.com/*",
      // Matches `https://example.com` and `https://example.com/path/to/file`

+     "*://example.com/path",
      // Matches `http://example.com/path` and `https://example.com/path`

+     "https://*.example.com/"
      // Matches `https://example.com` and `https://www.example.com/`
    ],
    // Other options...
  }
```

## How This Works

- Force [`user-select: auto`](https://developer.mozilla.org/docs/Web/CSS/user-select).

  Examples of what this will unblock:

  ```html
  <p style="user-select: none;">Hello</p>
  ```

- Wrap [`Event.prototype.preventDefault`](https://developer.mozilla.org/docs/Web/API/Event/preventDefault) by [`Proxy`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

  Examples of what this will unblock:

  ```html
  <p>Hello</p>
  <script>
    document.querySelector('p').addEventListener('selectstart', (event) => {
      event.preventDefault();
    });
    // or
    document.querySelector('p').onselectstart = (event) => {
      event.preventDefault();
    };
  </script>
  <!-- or -->
  <p onselectstart="arguments[0].preventDefault();">Hello</p>
  ```

- Wrap [setters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/set) for all event handlers (e.g., [`onselectstart`](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event)) for [`Node`](https://developer.mozilla.org/docs/Web/API/Node) subtype prototypes and [`window`](https://developer.mozilla.org/docs/Web/API/Window/window) by [`Proxy`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

  Examples of what this will unblock:

  ```html
  <p>Hello</p>
  <script>
    document.querySelector('p').onselectstart = () => {
      return false;
    };
  </script>
  ```

- Calls wrapped [setters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/set) to inline event handlers when elements are added or attributes are changed.

  Examples of what this will unblock:

  ```html
  <p onselectstart="return false;">Hello</p>
  ```

## Options

### `patterns`

Type: `string[]`

Default: `[]`

Match patterns for webpages to unblock copying.

Learn more about match patterns on [mdn web docs](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) or [Chrome for Developers](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

To activate it on a new page, the page must be reloaded.

### `eventTypes`

Type: `string[]`

Default: [src/default-storage/index.ts](src/default-storage/index.ts)

Event types to unblock copying.

Changes to this option are reflected immediately on the page.

### `css`

Type: `string`

Default: [src/default-storage/style.css](src/default-storage/style.css)

CSS styles to be inserted.

Changes to this option are reflected immediately on the page.

### `cssOrigin`

type: `'USER' | 'AUTHOR'`

Default: `'USER'`

An origin type of css to be inserted.

Learn [more about origin types](https://developer.mozilla.org/docs/Web/CSS/Cascade#origin_types).

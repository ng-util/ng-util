# @ng-util/lazy

Lazy load javascript, css resources for Angular.

[![NPM version](https://img.shields.io/npm/v/@ng-util/lazy.svg?style=flat-square)](https://www.npmjs.com/package/@ng-util/lazy)
[![Build Status](https://github.com/ng-util/ng-util/workflows/Build/badge.svg?branch=master)](https://github.com/ng-util/ng-util/actions)
[![codecov](https://codecov.io/gh/ng-util/ng-util/branch/master/graph/badge.svg)](https://codecov.io/gh/ng-util/ng-util)
[![Dependency Status](https://david-dm.org/ng-util/ng-util/status.svg?style=flat-square)](https://david-dm.org/ng-util/ng-util)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/ng-util/ng-util/blob/master/LICENSE)

## Demo

- [Stackblitz](https://stackblitz.com/edit/ng-util-lazy?file=src/app/app.component.ts)
- [Codesandbox](https://codesandbox.io/s/ng-util-lazy-mt7k2?file=/src/app/app.component.ts)

## Usage

```ts
import { Component } from '@angular/core';
import { NuLazyService } from '@ng-util/lazy';

@Component({
  selector: 'app-demo',
  template: ` <button *ngIf="loaded" type="button" class="btn btn-primary">Primary</button>`,
})
export class DemoComponent {
  loaded = false;

  constructor(private srv: NuLazyService) {
    this.load();
  }

  async load() {
    await this.srv.load([
      `https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css`,
      `https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.bundle.min.js`,
    ]);
    this.loaded = true;
  }
}
```

## API

| name | type | description |
| ---- | -- | ----------- |
| `monitor(paths: string ｜ Array<string ｜ NuLazyResources>)` | `Observable<NuLazyResult[]>` | Monitor for the finished of `paths` |
| `clear()` | `void` | Clean all cached items |
| `load(paths: string ｜ Array<string ｜ NuLazyResources>)` | `Promise<NuLazyResult[]>` | Load the specified resources, includes `.js`, `.css` |
| `loadScript(path: string, options?: { innerContent?: string })` | `Promise<NuLazyResult>` | Load a script resources |
| `loadStyle(path: string, options?: { ref?: string, innerContent?: string })` | `Promise<NuLazyResult>` | Load a style resources |

### License

The MIT License (see the [LICENSE](https://github.com/ng-util/ng-util/blob/master/LICENSE) file for the full text)

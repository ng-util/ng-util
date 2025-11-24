# @ng-util/markdown

[Vditor](https://github.com/Vanessa219/vditor) for Angular.

[![NPM version](https://img.shields.io/npm/v/@ng-util/markdown.svg?style=flat-square)](https://www.npmjs.com/package/@ng-util/markdown)
[![Build Status](https://github.com/ng-util/ng-util/workflows/Build/badge.svg?branch=master)](https://github.com/ng-util/ng-util/actions)
[![codecov](https://codecov.io/gh/ng-util/ng-util/branch/master/graph/badge.svg)](https://codecov.io/gh/ng-util/ng-util)
[![Dependency Status](https://david-dm.org/ng-util/ng-util/status.svg?style=flat-square)](https://david-dm.org/ng-util/ng-util)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/ng-util/ng-util/blob/master/LICENSE)

## Demo

- [Stackblitz](https://stackblitz.com/edit/ng-util-markdown?file=src/app/app.component.ts)

## Usage

### Installation

Install from npm repository:

```bash
npm install @ng-util/markdown --save
```

### Simple

```ts
import { Component } from '@angular/core';
import { NuMonacoEditorComponent } from '@ng-util/monaco-editor';

@Component({
  selector: 'demo',
  template: `
    <nu-monaco-editor />
  `,
  imports: [NuMonacoEditorComponent],
})
export class MonacoDemo { }
```

Create markdown options in component.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<nu-markdown [(ngModel)]="value" />`,
})
export class DemoComponent {
  value = '# Title';
}
```

**Preview**

You can use `nu-markdown-preview` component to render a Markdown preview effect (no editing).

```html
<nu-markdown-preview value="# Title" />
```

### How to change cdn?

- Using `provideNuMarkdownConfig({ libs: [] })` to adjust.

The libs parameter should contain `index.min.js` and `index.css`, like this:

```ts
provideNuMarkdownConfig({
  libs: [
    'https://cdn.jsdelivr.net/npm/vditor/dist/index.min.js',
    'https://cdn.jsdelivr.net/npm/vditor/dist/index.css'
  ]
})
```

In addition, You can also use local path:

```json
// angular.json
{
  "glob": "*.(js|css)",
  "input": "node_modules/vditor/dist",
  "output": "/assets/vditor/"
}
```

Then modify the libs path:

```ts
provideNuMarkdownConfig({
  libs: [
    './assets/vditor/index.min.js',
    './assets/vditor/index.css'
  ]
})
```

## API

### nu-markdown

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[options]` | Equar [IOptions](https://ld246.com/article/1549638745630#options) | `any` | - |
| `[disabled]` | Disabled of markdown editor | `boolean` | `false` |
| `[delay]` | Delay init monaco editor, unit: ms | `number` | `0` |
| `(ready)` | Ready event | `EventEmitter<any>` | - |

### nu-markdown-preview

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[options]` | Equar [IOptions](https://ld246.com/article/1549638745630#options-preview) | `any` | - |
| `[delay]` | Delay init monaco editor, unit: ms | `number` | `0` |
| `(ready)` | Ready event | `EventEmitter<string>` | - |

### License

The MIT License (see the [LICENSE](https://github.com/ng-util/ng-util/blob/master/LICENSE) file for the full text)


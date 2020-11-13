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
- [Codesandbox](https://codesandbox.io/s/ng-util-markdown-nudj1?file=/src/app/app.component.ts)

## Usage

### Installation

Install from npm repository:

```bash
npm install @ng-util/markdown --save
```

### Sample

Include `NuMarkdownModule` in Main Module and Feature Modules where you want to use the editor component.(eg: app.module.ts):

```ts
import { NgModule } from '@angular/core';
import { NuMarkdownModule } from '@ng-util/markdown';

@NgModule({
  imports: [
    NuMarkdownModule.forRoot() // use forRoot() in main app module only.
  ],
})
export class AppModule { }
```

Create markdown options in component.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<nu-markdown [(ngModel)]="value"></nu-markdown>`,
})
export class DemoComponent {
  value = '# Title';
}
```

**Preview**

You can use `nu-markdown-preview` component to render a Markdown preview effect (no editing).

```html
<nu-markdown-preview value="# Title"></nu-markdown-preview>
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


# @ng-util/monaco-editor

Monaco Code Editor for Angular.

> Inspired by [ngx-monaco-editor](https://github.com/atularen/ngx-monaco-editor).

[![NPM version](https://img.shields.io/npm/v/@ng-util/monaco-editor.svg?style=flat-square)](https://www.npmjs.com/package/@ng-util/monaco-editor)
[![Build Status](https://github.com/ng-util/ng-util/workflows/Build/badge.svg?branch=master)](https://github.com/ng-util/ng-util/actions)
[![codecov](https://codecov.io/gh/ng-util/ng-util/branch/master/graph/badge.svg)](https://codecov.io/gh/ng-util/ng-util)
[![Dependency Status](https://david-dm.org/ng-util/ng-util/status.svg?style=flat-square)](https://david-dm.org/ng-util/ng-util)
[![prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/ng-util/ng-util/blob/master/LICENSE)

## Demo

- [Stackblitz](https://stackblitz.com/edit/ng-util-monaco-editor?file=src/app/app.component.ts)
- [Codesandbox](https://codesandbox.io/s/ng-util-monaco-editor-0m474?file=/src/app/app.component.ts)

## Usage

### Installation

Install from npm repository:

```bash
npm install @ng-util/monaco-editor --save
```

**Configure monaco-editor library**

Currently this library only supports load monaco-editor with AMD mode. The default is to use cdn (`https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min`) lazy loading。

If you are using local monaco editor library, you could add the following:

```
"assets": [
  {
    "glob": "**/*",
    "input": "node_modules/monaco-editor/min/vs",
    "output": "/lib/vs"
  }
],
```

And configure `baseUrl` via `NuMonacoEditorModule.forRoot`.

```ts
NuMonacoEditorModule.forRoot({
  baseUrl: `lib`,
}),
```

### Sample

Include `NuMonacoEditorModule` in Main Module and Feature Modules where you want to use the editor component.(eg: app.module.ts):

```ts
import { NgModule } from '@angular/core';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

@NgModule({
  imports: [
    NuMonacoEditorModule.forRoot() // use forRoot() in main app module only.
  ],
})
export class AppModule { }
```

Create Editor options in component.

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<nu-monaco-editor [(ngModel)]="value" [options]="editorOptions"></nu-monaco-editor>`,
})
export class DemoComponent {
  value: string = 'const a = 1;';
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
}
```

Or monaco diff editor:

```ts
import { Component } from '@angular/core';
import { NuMonacoEditorDiffModel } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-root',
  template: `<nu-monaco-diff-editor [options]="editorOptions" [old]="old" [new]="new"></nu-monaco-diff-editor>`,
})
export class DemoComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  old: NuMonacoEditorDiffModel = { code: `<p>1</p>` };
  new: NuMonacoEditorDiffModel = { code: `<p>2</p>` };
}
```

### Events

Output `event` can be divided into different stages of feedback according to the `type` attribute. When you need to initialize` init`, you can program the editor in one step.

```ts
import { Component } from '@angular/core';
import { NuMonacoEditorEvent } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-root',
  template: `<nu-monaco-editor [(ngModel)]="value" [options]="editorOptions" (event)="showEvent($event)"></nu-monaco-editor>`,
})
export class DemoComponent {
  value: string = 'const a = 1;';
  editorOptions = { theme: 'vs-dark', language: 'javascript' };

  showEvent(e: NuMonacoEditorEvent): void {
    if (e.type === 'init') {
      // doing
    }
  }
}
```

### Configurations

`forRoot()` method of `NuMonacoEditorModule` accepts config of type `NuMonacoEditorConfig`.

```ts
NuMonacoEditorModule.forRoot({
  baseUrl: ``, // The base URL to monaco editor library assets via AMD (RequireJS), Default: `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min`
  defaultOptions: {}, // Default options when creating editors
  monacoLoad: (m) => {} // The event after the first loading of the monaco editor library is completed, use this function to extend monaco editor functionalities.
}),
```

#### Configure JSON Defaults

`monacoLoad` property of `NuMonacoEditorConfig` can be used to configure JSON default.

```ts
NuMonacoEditorModule.forRoot({
  defaultOptions: { scrollBeyondLastLine: false },
  monacoLoad: () => {
    const uri = monaco.Uri.parse('a://b/foo.json');
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://myserver/foo-schema.json',
          fileMatch: [uri.toString()],
          schema: {
            type: 'object',
            properties: {
              p1: {
                enum: ['v1', 'v2'],
              },
              p2: {
                $ref: 'http://myserver/bar-schema.json',
              },
            },
          },
        },
        {
          uri: 'http://myserver/bar-schema.json',
          fileMatch: [uri.toString()],
          schema: {
            type: 'object',
            properties: {
              q1: {
                enum: ['x1', 'x2'],
              },
            },
          },
        },
      ],
    });
  },
}),
```

Now pass `model` config of type `NuMonacoEditorModule` to Editor Component.

```ts
import { Component } from '@angular/core';
import { NuMonacoEditorEvent, NuMonacoEditorModel } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-demo',
  template: `
  <nu-monaco-editor #a [(ngModel)]="value" [model]="model" (event)="showEvent($event)"></nu-monaco-editor>
  <button (click)="a.editor.getAction('editor.action.formatDocument').run()">Format document</button>
  `,
})
export class DemoComponent {
  value = '{"p1":"a"}';
  model: NuMonacoEditorModel;

  showEvent(e: NuMonacoEditorEvent) {
    if (e.type === 'init') {
      this.model = {
        language: 'json',
        uri: monaco.Uri.parse('a://b/foo.json'),
      };
    }
  }
}
```


## API

### nu-monaco-editor

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[height]` | Height of monaco editor | `string` | `200px` |
| `[disabled]` | Disabled of monaco editor | `boolean` | `false` |
| `[options]` | Default options when creating editors | `monaco.editor.IStandaloneEditorConstructionOptions` | - |
| `[model]` | Model of monaco editor | `NuMonacoEditorModel` | - |
| `[delay]` | Delay init monaco editor, unit: ms | `number` | `0` |
| `(event)` | Event callback | `EventEmitter<NuMonacoEditorEvent>` | - |

### nu-monaco-diff-editor

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `[height]` | Height of monaco editor | `string` | `200px` |
| `[disabled]` | Disabled of monaco editor | `boolean` | `false` |
| `[options]` | Default options when creating editors | `monaco.editor.IStandaloneEditorConstructionOptions` | - |
| `[old]` | Old model of monaco editor | `NuMonacoEditorDiffModel` | - |
| `[new]` | New model of monaco editor | `NuMonacoEditorDiffModel` | - |
| `[delay]` | Delay init monaco editor, unit: ms | `number` | `0` |
| `(event)` | Event callback | `EventEmitter<NuMonacoEditorEvent>` | - |

### License

The MIT License (see the [LICENSE](https://github.com/ng-util/ng-util/blob/master/LICENSE) file for the full text)


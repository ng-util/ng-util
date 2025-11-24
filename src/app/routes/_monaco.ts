import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  NuMonacoEditorComponent,
  NuMonacoEditorDiffComponent,
  NuMonacoEditorDiffModel,
  NuMonacoEditorEvent,
  NuMonacoEditorModel
} from '@ng-util/monaco-editor';

@Component({
  selector: 'monaco-demo',
  template: `
    <button (click)="disabled = !disabled">Set {{ disabled ? 'enabled' : 'disabled' }}</button>
    @for (t of themes; track $index) {
      <button (click)="setTheme(t)">{{ t }} theme</button>
    }
    <button (click)="placeholder = 'new placeholder'">Update placeholder</button>
    <h1>Base</h1>
    <button (click)="updateModel()">Update model</button>
    <nu-monaco-editor #a [placeholder]="placeholder" [model]="model()" [options]="options" [disabled]="disabled" />
    <h1>Diff</h1>
    <nu-monaco-diff-editor #b [old]="oldModel" [new]="newModel" [options]="options" [disabled]="disabled" />
    <h1>Custom json</h1>
    <nu-monaco-editor #c [(ngModel)]="value" [model]="jsonModel" (event)="jsonEvent($event)" [disabled]="disabled" />
    <button (click)="format(c)">Format document</button>
  `,
  imports: [FormsModule, NuMonacoEditorComponent, NuMonacoEditorDiffComponent]
})
export class MonacoDemo {
  disabled = false;
  themes = ['vs', 'vs-dark', 'hc-black'];
  value = '{"p1":"a"}';
  placeholder =
    'Type something...<a href="https://www.google.com/maps/dir/45.81444,15.97792/@45.81444,15.97792,20z?hl=zh" target="blank" style="color:#f50">Link</a>';
  options = { theme: 'vs' };
  model = signal<NuMonacoEditorModel>({
    // value: '<h1>Title</h1><p>asdf</p>',
    language: 'html'
  });
  oldModel: NuMonacoEditorDiffModel = {
    code: 'const a = 1;',
    language: 'typescript'
  };
  newModel: NuMonacoEditorDiffModel = {
    code: 'const a = 2;',
    language: 'typescript'
  };
  jsonModel: NuMonacoEditorModel | null = null;

  setTheme(theme: string): void {
    this.options = { theme };
  }

  jsonEvent(e: NuMonacoEditorEvent) {
    if (e.type === 'init') {
      this.jsonModel = {
        language: 'json',
        uri: monaco.Uri.parse('a://b/foo.json')
      };
    }
  }

  format(editor: NuMonacoEditorComponent) {
    editor.editor?.getAction('editor.action.formatDocument')?.run();
  }

  updateModel() {
    this.model.set({
      language: 'html',
      value: '<h1>Title</h1><p>Updated content</p>'
    });
  }
}

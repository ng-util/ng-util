import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NuMonacoEditorComponent,
  NuMonacoEditorDiffComponent,
  NuMonacoEditorDiffModel,
  NuMonacoEditorEvent,
  NuMonacoEditorModel,
} from '@ng-util/monaco-editor';

@Component({
  selector: 'monaco-demo',
  template: `
    <button (click)="disabled = !disabled">Set {{ disabled ? 'enabled' : 'disabled' }}</button>
    <button *ngFor="let t of themes" (click)="setTheme(t)">{{ t }} theme</button>
    <h1>Base</h1>
    <nu-monaco-editor #a [model]="model" [options]="options" [disabled]="disabled"></nu-monaco-editor>
    <h1>Diff</h1>
    <nu-monaco-diff-editor #b [old]="oldModel" [new]="newModel" [options]="options" [disabled]="disabled"></nu-monaco-diff-editor>
    <h1>Custom json</h1>
    <nu-monaco-editor
      #c
      [(ngModel)]="value"
      [model]="jsonModel"
      [options]="options"
      (event)="jsonEvent($event)"
      [disabled]="disabled"
    ></nu-monaco-editor>
    <button (click)="c.editor.getAction('editor.action.formatDocument').run()">Format document</button>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, NuMonacoEditorComponent, NuMonacoEditorDiffComponent],
})
export class MonacoDemoComponent {
  disabled = false;
  themes = ['vs', 'vs-dark', 'hc-black'];
  value = '{"p1":"a"}';
  options = { theme: 'vs' };
  model: NuMonacoEditorModel = {
    value: '<h1>Title</h1>',
    language: 'html',
  };
  oldModel: NuMonacoEditorDiffModel = {
    code: 'const a = 1;',
    language: 'typescript',
  };
  newModel: NuMonacoEditorDiffModel = {
    code: 'const a = 2;',
    language: 'typescript',
  };
  jsonModel: NuMonacoEditorModel | null = null;

  setTheme(theme: string): void {
    this.options = { theme };
  }

  jsonEvent(e: NuMonacoEditorEvent) {
    if (e.type === 'init') {
      this.jsonModel = {
        language: 'json',
        uri: monaco.Uri.parse('a://b/foo.json'),
      };
    }
  }
}

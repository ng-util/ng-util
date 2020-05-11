import { Component } from '@angular/core';
import { NuMonacoEditorDiffModel, NuMonacoEditorEvent, NuMonacoEditorModel } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-demo',
  template: `
    <button *ngFor="let i of themes" (click)="setTheme(i)">Set {{ i }}</button>
    <button (click)="disabled = !disabled">set {{ disabled ? 'enabled' : 'disabled' }}</button>
    <h1>nu-monaco-editor</h1>
    <nu-monaco-editor
      [(ngModel)]="value"
      [model]="model"
      [disabled]="disabled"
      [options]="options"
      (event)="showEvent('', $event)"
    ></nu-monaco-editor>
    <div>{{ value | json }}</div>
    <button (click)="updateValue()">Update Value</button>
    <h1>nu-monaco-diff-editor</h1>
    <nu-monaco-editor-diff
      [old]="old"
      [new]="new"
      [disabled]="disabled"
      [options]="options"
      (event)="showEvent('diff', $event)"
    ></nu-monaco-editor-diff>
    <button (click)="updateDiffValue()">Update Value</button>
  `,
})
export class DemoComponent {
  value = `import { Component } from '@angular/core';

  @Component({
    selector: 'app-demo',
    template: \`
      <nu-monaco-editor></nu-monaco-editor>
    \`,
  })
  export class DemoComponent {
  }
  `;

  options: monaco.editor.IStandaloneEditorConstructionOptions = {};
  model: NuMonacoEditorModel = { language: 'typescript' };
  disabled = false;

  old: NuMonacoEditorDiffModel = { code: `<p>1</p>` };
  new: NuMonacoEditorDiffModel = { code: `<p>2</p>` };

  themes = ['vs', 'vs-dark', 'hc-black'];

  updateValue(): void {
    this.value = `1`;
  }

  setTheme(theme: string): void {
    this.options = { theme };
  }

  showEvent(type: '' | 'diff', e: NuMonacoEditorEvent) {
    console.log(type, e);
  }

  updateDiffValue(): void {
    this.old = { code: 'var a = 1;', language: 'javascript' };
    this.new = { code: 'var a = 2;', language: 'javascript' };
  }
}

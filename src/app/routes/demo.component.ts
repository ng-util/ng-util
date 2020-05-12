import { Component } from '@angular/core';
import { NuMonacoEditorEvent, NuMonacoEditorModel } from '@ng-util/monaco-editor';

@Component({
  selector: 'app-demo',
  template: ` <nu-monaco-editor #a [(ngModel)]="value" [model]="model" (event)="showEvent($event)"></nu-monaco-editor>
    <button (click)="a.editor.getAction('editor.action.formatDocument').run()">Format document</button>`,
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

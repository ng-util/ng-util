import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorDiffModel } from './monaco-editor.types';

@Component({
  selector: 'nu-monaco-editor-diff',
  template: ``,
  host: {
    '[style.display]': `'block'`,
    '[style.height.px]': 'height',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuMonacoEditorDiffComponent extends NuMonacoEditorBase {
  @Input() old: NuMonacoEditorDiffModel;
  @Input() new: NuMonacoEditorDiffModel;

  initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions): void {
    if (!this.old || !this.new) {
      throw new Error('old or new not found for nu-monaco-editor-diff');
    }

    const theme = options.theme;
    const editor = (this._editor = monaco.editor.createDiffEditor(this.el.nativeElement, options));
    options.theme = theme;
    editor.setModel({
      original: monaco.editor.createModel(this.old.code, this.old.language || options.language),
      modified: monaco.editor.createModel(this.new.code, this.new.language || options.language),
    });

    this.registerResize().notifyEvent('init');
  }
}

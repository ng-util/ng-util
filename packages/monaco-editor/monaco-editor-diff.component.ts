import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorDiffModel } from './monaco-editor.types';

@Component({
  selector: 'nu-monaco-diff-editor',
  template: ``,
  exportAs: 'nuMonacoDiffEditor',
  host: {
    '[style.display]': `'block'`,
    '[style.height]': 'height'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuMonacoEditorDiffComponent extends NuMonacoEditorBase {
  @Input() old?: NuMonacoEditorDiffModel | null;
  @Input() new?: NuMonacoEditorDiffModel | null;

  get editor(): monaco.editor.IStandaloneDiffEditor | null | undefined {
    return this._editor as monaco.editor.IStandaloneDiffEditor;
  }

  initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions, initEvent: boolean): void {
    if (!this.old || !this.new) {
      this.notifyEvent('error', { error: 'old or new not found for nu-monaco-diff-editor' });
      return;
    }

    const theme = options.theme;
    if (this._disabled != null) options.readOnly = this._disabled;
    const editor = (this._editor = monaco.editor.createDiffEditor(this.el.nativeElement, options));
    options.theme = theme;
    editor.setModel({
      original: monaco.editor.createModel(this.old.code, this.old.language || options.language),
      modified: monaco.editor.createModel(this.new.code, this.new.language || options.language)
    });

    // this.setDisabled();
    editor.onDidUpdateDiff(() => this.notifyEvent('update-diff', { diffValue: editor.getModifiedEditor().getValue() }));

    this.registerResize();
    if (initEvent) this.notifyEvent('init');
  }
}

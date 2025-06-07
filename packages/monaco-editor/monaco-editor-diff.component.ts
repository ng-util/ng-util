import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorDiffModel } from './monaco-editor.types';

@Component({
  selector: 'nu-monaco-diff-editor',
  template: ``,
  exportAs: 'nuMonacoDiffEditor',
  host: {
    '[style.display]': `'block'`,
    '[style.height]': 'height()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuMonacoEditorDiffComponent extends NuMonacoEditorBase {
  old = input<NuMonacoEditorDiffModel>();
  new = input<NuMonacoEditorDiffModel>();

  get editor(): monaco.editor.IStandaloneDiffEditor | null | undefined {
    return this._editor as monaco.editor.IStandaloneDiffEditor;
  }

  initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions, initEvent: boolean): void {
    const oldModel = this.old();
    const newModel = this.new();
    if (!oldModel || !newModel) {
      this.notifyEvent('error', { error: 'old or new not found for nu-monaco-diff-editor' });
      return;
    }

    options = { ...this.config?.defaultOptions, ...options };
    const theme = options.theme;
    if (this._disabled != null) options.readOnly = this._disabled;
    const editor = (this._editor = monaco.editor.createDiffEditor(this.el.nativeElement, options));
    options.theme = theme;
    editor.setModel({
      original: monaco.editor.createModel(oldModel.code, oldModel.language || options.language),
      modified: monaco.editor.createModel(newModel.code, newModel.language || options.language)
    });

    // this.setDisabled();
    editor.onDidUpdateDiff(() => this.notifyEvent('update-diff', { diffValue: editor.getModifiedEditor().getValue() }));

    this.registerResize();
    if (initEvent) this.notifyEvent('init');
  }
}

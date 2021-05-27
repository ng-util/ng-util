import { ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorModel } from './monaco-editor.types';

@Component({
  selector: 'nu-monaco-editor',
  template: ``,
  exportAs: 'nuMonacoEditor',
  host: {
    '[style.display]': `'block'`,
    '[style.height]': 'height',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NuMonacoEditorComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuMonacoEditorComponent extends NuMonacoEditorBase implements ControlValueAccessor {
  private _value = '';

  @Input() model?: NuMonacoEditorModel;

  get editor(): monaco.editor.IStandaloneCodeEditor {
    return this._editor as monaco.editor.IStandaloneCodeEditor;
  }

  private onChange = (_: string) => {};
  private onTouched = () => {};

  initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions, initEvent: boolean): void {
    const hasModel = !!this.model;

    if (hasModel) {
      const model = monaco.editor.getModel(this.model!.uri! || '');
      if (model) {
        options.model = model;
        options.model.setValue(this._value);
      } else {
        const { value, language, uri } = this.model!;
        options.model = monaco.editor.createModel(value || this._value, language, uri);
      }
    }

    options.readOnly = this._disabled;
    const editor = (this._editor = monaco.editor.create(this.el.nativeElement, options));

    if (!hasModel) {
      editor.setValue(this._value);
    }

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();

      this.ngZone.run(() => {
        this._value = value;
        this.onChange(value);
      });
    });
    editor.onDidBlurEditorWidget(() => this.onTouched());

    this.registerResize();
    editor
      .getAction('editor.action.formatDocument')
      .run()
      .then(() => this.notifyEvent(initEvent ? 'init' : 're-init'));
  }

  writeValue(value: string): void {
    this._value = value || '';
    if (this._editor) {
      (this._editor as monaco.editor.IStandaloneCodeEditor).setValue(this._value);
    }
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    this.disabled = _isDisabled;
    this.setDisabled();
  }
}

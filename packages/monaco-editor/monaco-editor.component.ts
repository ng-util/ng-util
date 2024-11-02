import { booleanAttribute, ChangeDetectionStrategy, Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorModel } from './monaco-editor.types';
import { take, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlaceholderWidget } from './placholder';

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
  standalone: true,
})
export class NuMonacoEditorComponent extends NuMonacoEditorBase implements ControlValueAccessor {
  private _value = '';
  private _placeholderWidget?: PlaceholderWidget;
  private _placeholder?: string | null;

  @Input()
  set placeholder(v: string | null | undefined) {
    this._placeholder = v;
    this._placeholderWidget?.update(v);
  }
  @Input() model?: NuMonacoEditorModel | null;
  @Input({ transform: booleanAttribute }) autoFormat = true;

  get editor(): monaco.editor.IStandaloneCodeEditor | null | undefined {
    return this._editor as monaco.editor.IStandaloneCodeEditor;
  }

  private togglePlaceholder() {
    const text = this._placeholder;
    if (text == null || text.length <= 0 || this.editor == null) return;

    if (this._placeholderWidget == null) {
      this._placeholderWidget = new PlaceholderWidget(this.editor, text);
    }

    if (this._value.length > 0) {
      this.editor.removeContentWidget(this._placeholderWidget);
    } else {
      this.editor.addContentWidget(this._placeholderWidget);
    }
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

    if (this._disabled != null) options.readOnly = this._disabled;
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

      this.togglePlaceholder();
    });
    editor.onDidBlurEditorWidget(() => this.onTouched());

    this.togglePlaceholder();
    this.registerResize();

    const eventName = initEvent ? 'init' : 're-init';
    if (this.autoFormat) {
      timer(this._config.autoFormatTime!)
        .pipe(takeUntilDestroyed(this.destroy$), take(1))
        .subscribe(() => {
          const action = editor.getAction('editor.action.formatDocument');
          if (action == null) {
            this.notifyEvent(eventName);
            return;
          }
          action.run().then(() => this.notifyEvent(eventName));
        });
      return;
    }
    this.notifyEvent(eventName);
  }

  writeValue(value: string): void {
    this._value = value || '';
    (this._editor as monaco.editor.IStandaloneCodeEditor)?.setValue(this._value);
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

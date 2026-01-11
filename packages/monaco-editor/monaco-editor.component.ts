import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  numberAttribute,
  untracked
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { take, timer } from 'rxjs';

import { NuMonacoEditorBase } from './monaco-editor-base.component';
import { NuMonacoEditorModel } from './monaco-editor.types';
import { PlaceholderWidget } from './placholder';

@Component({
  selector: 'nu-monaco-editor',
  template: ``,
  exportAs: 'nuMonacoEditor',
  host: {
    '[style.display]': `'block'`,
    '[style.height]': 'height()'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NuMonacoEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuMonacoEditorComponent extends NuMonacoEditorBase implements ControlValueAccessor {
  private _value = '';
  private _placeholderWidget?: PlaceholderWidget;
  placeholder = input<string>();
  model = input<NuMonacoEditorModel | null>();
  autoFormat = input(true, { transform: booleanAttribute });
  maxHeight = input(1000, { transform: numberAttribute });

  get editor(): monaco.editor.IStandaloneCodeEditor | null | undefined {
    return this._editor as monaco.editor.IStandaloneCodeEditor;
  }

  constructor() {
    super();
    effect(() => {
      const ph = this.placeholder();
      this._placeholderWidget?.update(ph);
    });
    effect(() => {
      const model = this.model();
      if (model == null) return;
      this.updateOptions(untracked(() => this.options()));
    });
  }

  private togglePlaceholder() {
    const text = this.placeholder();
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
    const hasModel = !!this.model();
    options = { ...this.config?.defaultOptions, ...options };
    const heightAuto = this.height() === 'auto';
    if (heightAuto) {
      options.scrollBeyondLastLine = false;
      options.overviewRulerLanes = 0;
    }

    if (hasModel) {
      const model = monaco.editor.getModel(this.model()!.uri! || '');
      if (model) {
        options.model = model;
        options.model.setValue(this._value);
      } else {
        const { value, language, uri } = this.model()!;
        options.model = monaco.editor.createModel(value || this._value, language, uri);
      }
      this._value = options.model.getValue();
    }

    if (this._disabled != null) options.readOnly = this._disabled;
    const editor = (this._editor = monaco.editor.create(this.el.nativeElement, options));

    if (!hasModel) {
      editor.setValue(this._value);
    }

    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      this._value = value;

      this.onChange(value);

      this.togglePlaceholder();
    });
    editor.onDidBlurEditorWidget(() => this.onTouched());

    this.togglePlaceholder();
    this.registerResize();
    if (heightAuto) {
      editor.onDidContentSizeChange(() => this.updateHeight());
      this.updateHeight();
    }

    const eventName = initEvent ? 'init' : 're-init';
    if (this.autoFormat()) {
      timer(this._config.autoFormatTime!)
        .pipe(takeUntilDestroyed(this.destroy$), take(1))
        .subscribe(() => {
          this.format()?.then(() => this.notifyEvent(eventName));
        });
      return;
    }
    this.notifyEvent(eventName);
  }

  private updateHeight() {
    const editor = this.editor;
    if (editor == null) return;

    const contentHeight = Math.min(this.maxHeight(), editor.getContentHeight());
    editor.layout({ width: editor.getLayoutInfo().width, height: contentHeight });
  }

  format(): Promise<void> | undefined {
    const action = this.editor?.getAction('editor.action.formatDocument');
    if (action == null) return;
    return action.run();
  }

  writeValue(value: string): void {
    this._value = value || '';
    (this._editor as monaco.editor.IStandaloneCodeEditor)?.setValue(this._value);
    if (this.autoFormat()) {
      this.format();
    }
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(v: boolean): void {
    this.setDisabled(v);
  }
}

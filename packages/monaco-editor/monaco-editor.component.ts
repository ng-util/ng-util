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
import { PlaceholderWidget } from './placeholder';

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
  readonly placeholder = input<string>();
  readonly model = input<NuMonacoEditorModel | null>();
  readonly autoFormat = input(true, { transform: booleanAttribute });
  readonly maxHeight = input(undefined, { transform: numberAttribute });
  readonly minHeight = input(undefined, { transform: numberAttribute });

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

  private togglePlaceholder(): void {
    const text = this.placeholder();
    if (typeof text !== 'string' || text.length <= 0 || this.editor == null) return;

    let widget = this._placeholderWidget;
    if (widget == null) {
      this._placeholderWidget = widget = new PlaceholderWidget(this.editor, text);
    }

    if (this._value.length > 0) {
      this.editor.removeContentWidget(widget);
    } else {
      this.editor.addContentWidget(widget);
    }
  }

  private onChange = (_: string): void => {};
  private onTouched = (): void => {};

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

    this._disposables.push(
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        this._value = value;

        this.onChange(value);

        this.togglePlaceholder();
      })
    );
    this._disposables.push(editor.onDidBlurEditorWidget(() => this.onTouched()));

    this.togglePlaceholder();
    this.registerResize();
    if (heightAuto) {
      this._disposables.push(editor.onDidContentSizeChange(() => this.updateHeight()));
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

  private updateHeight(): void {
    const editor = this.editor;
    if (editor == null) return;

    const isFiniteNumber = (value?: number): value is number => value != null && Number.isFinite(value);
    const contentHeight = editor.getContentHeight();
    const minHeightLimit = this.minHeight();
    const maxHeightInput = this.maxHeight();
    const maxHeightLimit = isFiniteNumber(maxHeightInput) ? maxHeightInput : 1000;

    let targetHeight = Math.min(contentHeight, maxHeightLimit);
    if (isFiniteNumber(minHeightLimit)) {
      targetHeight = Math.max(targetHeight, minHeightLimit);
    }

    editor.layout({ width: editor.getLayoutInfo().width, height: targetHeight });
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

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(v: boolean): void {
    this.setDisabled(v);
  }
}

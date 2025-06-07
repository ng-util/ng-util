import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { NuMarkdownBaseComponent } from './markdown-base.component';
import type VditorType from 'vditor';

declare let Vditor: any;

@Component({
  selector: 'nu-markdown',
  template: ``,
  exportAs: 'nuMarkdown',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NuMarkdownComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuMarkdownComponent extends NuMarkdownBaseComponent implements ControlValueAccessor {
  options = input<VditorType['vditor']['options']>();
  readonly ready = new EventEmitter<VditorType>();

  private value = '';
  private onChange = (_: string) => {};

  protected init(): void {
    const options: VditorType['vditor']['options'] = {
      value: this.value,
      cache: {
        enable: false
      },
      mode: 'sv',
      minHeight: 350,
      input: (value: string) => {
        this.onChange(value);
      },
      after: () => {
        this.setDisabled(this.disabled());
      },
      ...this.config?.defaultOptions,
      ...this.options
    };
    this._instance = new Vditor(this.el.nativeElement, options);
    this.ready.emit(this._instance);
  }

  private setDisabled(v: boolean): void {
    const i = this._instance;
    if (i == null) return;
    if (v) {
      i.disabled();
    } else {
      i.enable();
    }
  }

  writeValue(value: string): void {
    this.value = value;
    this.instance?.setValue(value);
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  setDisabledState(v: boolean): void {
    this.setDisabled(v);
  }
}

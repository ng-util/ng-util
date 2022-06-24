import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NuMarkdownBaseComponent } from './markdown-base.component';

declare var Vditor: any;

@Component({
  selector: 'nu-markdown',
  template: ``,
  exportAs: 'nuMarkdown',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NuMarkdownComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NuMarkdownComponent extends NuMarkdownBaseComponent implements ControlValueAccessor {
  private onChange = (_: string) => {};

  protected init(): void {
    this.ngZone.runOutsideAngular(() => {
      const options = {
        value: this._value,
        cache: {
          enable: false,
        },
        mode: 'sv',
        minHeight: 350,
        input: (value: string) => {
          this.ngZone.run(() => {
            this._value = value;
            this.onChange(value);
          });
        },
        ...this.config?.defaultOptions,
        ...this.options,
      };
      this._instance = new Vditor(this.el.nativeElement, options);
      this.ngZone.run(() => this.ready.emit(this._instance));
    });
  }

  private setDisabled(): void {
    if (!this.instance) {
      return;
    }
    if (this.disabled) {
      this.instance.disabled();
    } else {
      this.instance.enable();
    }
  }

  writeValue(value: string): void {
    this._value = value || '';
    if (this.instance) {
      this.instance.setValue(this._value);
    }
  }

  registerOnChange(fn: (_: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(_: () => void): void {}

  setDisabledState(_isDisabled: boolean): void {
    this.disabled = _isDisabled;
    this.setDisabled();
  }
}

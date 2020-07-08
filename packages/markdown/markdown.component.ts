import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputNumber } from '@ng-util/util/convert';
import { Subscription } from 'rxjs';
import { NuMarkdownConfig, NU_MARKDOWN_CONFIG } from './markdown.config';
import { NuMarkdownService } from './markdown.service';

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
})
export class NuMarkdownComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  get instance(): any {
    return this._instance;
  }

  constructor(
    protected el: ElementRef<HTMLElement>,
    @Inject(NU_MARKDOWN_CONFIG) private config: NuMarkdownConfig,
    private srv: NuMarkdownService,
    protected ngZone: NgZone,
  ) {
    this.notify$ = this.srv.notify.subscribe(() => this.initDelay());
  }

  private notify$: Subscription;
  private _instance: any;
  private _value: string;
  @Input() options: any;
  @Input() disabled: boolean;
  @Input() @InputNumber() delay: number;
  @Output() ready = new EventEmitter<any>();
  private onChange = (_: string) => {};

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay);
  }

  private init(): void {
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
      this.ready.emit(this._instance);
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

  ngAfterViewInit(): void {
    if ((window as any).QRious) {
      this.initDelay();
      return;
    }
    this.srv.load();
  }

  ngOnDestroy(): void {
    this.notify$.unsubscribe();
  }
}

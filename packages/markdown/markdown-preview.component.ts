import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NuMarkdownBaseComponent } from './markdown-base.component';

declare var Vditor: any;

@Component({
  selector: 'nu-markdown-preview',
  template: `{{ value }}`,
  exportAs: 'nuMarkdownPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuMarkdownPreviewComponent extends NuMarkdownBaseComponent {
  private _value: string;
  @Input()
  set value(v: string) {
    this._value = v;
    if (this.loaded) {
      this.init();
    }
  }
  @Input() options: any;
  @Input() disabled: boolean;
  @Output() ready = new EventEmitter<string>();

  protected init(): void {
    this.ngZone.runOutsideAngular(async () => {
      await Vditor.preview(this.el.nativeElement, this._value);
      console.log(this.el.nativeElement.innerHTML);
      this.ngZone.run(() => this.ready.emit(this.el.nativeElement.innerHTML));
    });
  }
}

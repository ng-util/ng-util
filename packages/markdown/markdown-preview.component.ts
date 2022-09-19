import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NuMarkdownBaseComponent } from './markdown-base.component';

declare var Vditor: any;

@Component({
  selector: 'nu-markdown-preview',
  template: ``,
  exportAs: 'nuMarkdownPreview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class NuMarkdownPreviewComponent extends NuMarkdownBaseComponent {
  protected init(): void {
    this.ngZone.runOutsideAngular(async () => {
      const options = {
        value: this._value,
        cache: {
          enable: false,
        },
        mode: 'sv',
        minHeight: 350,
        ...this.config?.defaultOptions,
        ...this.options,
      };
      await Vditor.preview(this.el.nativeElement, this._value, options);
      this.ngZone.run(() => this.ready.emit(this.el.nativeElement.innerHTML));
    });
  }
}

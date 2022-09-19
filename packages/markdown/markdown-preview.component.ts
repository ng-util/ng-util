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
      await Vditor.preview(this.el.nativeElement, this._value, this.options);
      this.ngZone.run(() => this.ready.emit(this.el.nativeElement.innerHTML));
    });
  }
}

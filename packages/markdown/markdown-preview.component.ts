import { ChangeDetectionStrategy, Component, EventEmitter, input } from '@angular/core';

import { NuMarkdownBaseComponent } from './markdown-base.component';

declare let Vditor: any;

@Component({
  selector: 'nu-markdown-preview',
  template: ``,
  exportAs: 'nuMarkdownPreview',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuMarkdownPreviewComponent extends NuMarkdownBaseComponent {
  options = input<any>();
  value = input<string>('');
  readonly ready = new EventEmitter<string>();

  protected async init() {
    await Vditor.preview(this.el.nativeElement, this.value(), {
      cdn: 'https://cdn.jsdelivr.net/npm/vditor',
      ...this.options()
    });
    this.ready.emit(this.el.nativeElement.innerHTML);
  }
}

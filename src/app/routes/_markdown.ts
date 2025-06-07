import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NuMarkdownComponent, NuMarkdownPreviewComponent } from '@ng-util/markdown';

@Component({
  selector: 'markdown-demo',
  template: `
    <button (click)="value.set('# Update')">Update value</button>
    <button (click)="disabled.set(!disabled())">Set {{ disabled() ? 'enabled' : 'disabled' }}</button>
    <h1>Markdown Editor</h1>
    <nu-markdown [(ngModel)]="value" [disabled]="disabled()"></nu-markdown>
    <h1>Preview Demo</h1>
    <nu-markdown-preview [value]="previewValue()" />
  `,
  imports: [FormsModule, NuMarkdownComponent, NuMarkdownPreviewComponent]
})
export class MarkdownDemo {
  value = signal('# Title');
  previewValue = signal(`- Preview Title
    - asdf`);

  disabled = signal(false);
}

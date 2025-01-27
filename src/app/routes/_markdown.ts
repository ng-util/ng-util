import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NuMarkdownComponent } from '@ng-util/markdown';

@Component({
  selector: 'markdown-demo',
  template: `<nu-markdown [(ngModel)]="value"></nu-markdown>`,
  imports: [FormsModule, NuMarkdownComponent]
})
export class MarkdownDemo {
  value = '# Title';
}

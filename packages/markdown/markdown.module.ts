import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { NuMarkdownPreviewComponent } from './markdown-preview.component';
import { NuMarkdownComponent } from './markdown.component';
import { NuMarkdownConfig, NU_MARKDOWN_CONFIG } from './markdown.config';

const COMPONENTS = [NuMarkdownComponent, NuMarkdownPreviewComponent];

@NgModule({
  imports: [CommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class NuMarkdownModule {
  static forRoot(config?: NuMarkdownConfig): ModuleWithProviders<NuMarkdownModule> {
    return {
      ngModule: NuMarkdownModule,
      providers: [{ provide: NU_MARKDOWN_CONFIG, useValue: config }],
    };
  }
}

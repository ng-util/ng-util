import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { NuMonacoEditorDiffComponent } from './monaco-editor-diff.component';
import { NuMonacoEditorComponent } from './monaco-editor.component';
import { NuMonacoEditorConfig, NU_MONACO_EDITOR_CONFIG } from './monaco-editor.config';

const COMPONENTS = [NuMonacoEditorComponent, NuMonacoEditorDiffComponent];

@NgModule({
  imports: [CommonModule, ...COMPONENTS],
  exports: COMPONENTS
})
export class NuMonacoEditorModule {
  /**
   * Or use `provideNuMonacoEditorConfig` instead.
   */
  static forRoot(config?: NuMonacoEditorConfig): ModuleWithProviders<NuMonacoEditorModule> {
    return {
      ngModule: NuMonacoEditorModule,
      providers: [{ provide: NU_MONACO_EDITOR_CONFIG, useValue: config }]
    };
  }
}

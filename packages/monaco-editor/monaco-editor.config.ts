import { InjectionToken } from '@angular/core';

export const NU_MONACO_EDITOR_CONFIG = new InjectionToken('NU_MONACO_EDITOR_CONFIG');

export interface NuMonacoEditorConfig {
  baseUrl?: string;
  defaultOptions?: monaco.editor.IStandaloneEditorConstructionOptions;
  monacoLoad?: (_monaco: any) => void;
}

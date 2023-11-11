import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export const NU_MONACO_EDITOR_CONFIG = new InjectionToken('NU_MONACO_EDITOR_CONFIG');

export function provideNuMonacoEditorConfig(config?: NuMonacoEditorConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: NU_MONACO_EDITOR_CONFIG, useValue: config }]);
}

export interface NuMonacoEditorConfig {
  /**
   * The base URL to monaco editor library assets via AMD (RequireJS), Default: `https://cdn.jsdelivr.net/npm/monaco-editor/min`
   * You can using local path, e.g.: `assets/monaco-editor/min`.
   */
  baseUrl?: string;
  /**
   * Default options when creating editors
   */
  defaultOptions?: monaco.editor.IStandaloneEditorConstructionOptions;
  /**
   * The event after the first loading of the monaco editor library is completed, use this function to extend monaco editor functionalities.
   * - @param `_monaco` equar to `window.monaco`
   */
  monacoLoad?: (_monaco: any) => void;
  /**
   * The event before the first preload of the monaco editor library is completed, use this function to set nls availableLanguages.
   */
  monacoPreLoad?: () => void;
  /**
   * Trigger automatic format delay time, default: `100`
   */
  autoFormatTime?: number;
}

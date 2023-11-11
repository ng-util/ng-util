import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

export const NU_MARKDOWN_CONFIG = new InjectionToken<NuMarkdownConfig>('NU_MARKDOWN_CONFIG');

export function provideNuMarkdownConfig(config?: NuMarkdownConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: NU_MARKDOWN_CONFIG, useValue: config }]);
}

export interface NuMarkdownConfig {
  /**
   * The base URL to [Vditor](https://github.com/Vanessa219/vditor) library, Default: `['https://cdn.jsdelivr.net/npm/vditor/dist/index.min.js', 'https://cdn.jsdelivr.net/npm/vditor/dist/index.css']`
   */
  libs?: string[];

  /**
   * Equar [IOptions](https://github.com/Vanessa219/vditor/blob/master/types/index.d.ts#L432)
   */
  defaultOptions?: any;
}

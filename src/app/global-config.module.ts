import { ModuleWithProviders, NgModule } from '@angular/core';

@NgModule({})
export class GlobalConfigModule {
  static forRoot(): ModuleWithProviders<GlobalConfigModule> {
    return {
      ngModule: GlobalConfigModule,
    };
  }
}

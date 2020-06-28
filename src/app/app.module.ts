// import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RoutesModule } from './routes/routes.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { LayoutComponent } from './layout/layout.component';

import { GlobalConfigModule } from './global-config.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    GlobalConfigModule.forRoot(),
    // LayoutModule,
    SharedModule,
    RoutesModule,
  ],
  declarations: [AppComponent, LayoutComponent, HeaderComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app/index';
import { ROUTERS } from './app/routes';

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(ROUTERS), provideZonelessChangeDetection()]
}).catch(err => console.error(err));

import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app/index';
import { ROUTERS } from './app/routes';
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(ROUTERS), provideZonelessChangeDetection()]
}).catch(err => console.error(err));

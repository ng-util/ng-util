import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app/index';
import { ROUTERS } from './app/routes';

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(ROUTERS)]
}).catch(err => console.error(err));

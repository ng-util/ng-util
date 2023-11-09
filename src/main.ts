import { provideHttpClient } from '@angular/common/http';
import { App } from './app/index';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ROUTERS } from './app/routes';

bootstrapApplication(App, {
  providers: [provideHttpClient(), provideRouter(ROUTERS)],
}).catch((err) => console.error(err));

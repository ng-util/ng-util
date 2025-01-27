import { Route } from '@angular/router';

import { MarkdownDemo } from './_markdown';
import { MonacoDemo } from './_monaco';

export const ROUTERS: Route[] = [
  { path: 'monaco', component: MonacoDemo },
  { path: 'markdown', component: MarkdownDemo },
  { path: '**', redirectTo: 'monaco' }
];

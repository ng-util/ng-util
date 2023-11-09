import { Route } from '@angular/router';
import { MonacoDemo } from './_monaco';
import { MarkdownDemo } from './_markdown';

export const ROUTERS: Route[] = [
  { path: 'monaco', component: MonacoDemo },
  { path: 'markdown', component: MarkdownDemo },
  { path: '**', redirectTo: 'monaco' },
];

import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `,
  host: {
    '[class.page-wrapper]': 'true',
  },
})
export class LayoutComponent {}

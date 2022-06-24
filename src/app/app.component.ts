import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `,
  host: {
    '[style.display]': `'block'`,
    '[style.padding.px]': `32`,
  },
})
export class AppComponent {}

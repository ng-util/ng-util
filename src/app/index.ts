import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <p style="margin-top: 0">
      <a routerLink="/monaco">Monaco</a>,
      <a routerLink="/markdown">Markdown</a>
    </p>
    <router-outlet />
  `,
  host: {
    '[style.display]': `'block'`
  },
  imports: [RouterOutlet, RouterLink]
})
export class App {}

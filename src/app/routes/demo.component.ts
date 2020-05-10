import { Component } from '@angular/core';
import { NuLazyService } from '@ng-util/lazy';

@Component({
  selector: 'app-demo',
  template: ` <button *ngIf="loaded" type="button" class="btn btn-primary">Primary</button>`,
})
export class DemoComponent {
  loaded = false;

  constructor(private srv: NuLazyService) {
    this.load();
  }

  async load() {
    await this.srv.load([
      `https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css`,
      `https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/4.4.1/js/bootstrap.bundle.min.js`,
    ]);
    this.loaded = true;
  }
}

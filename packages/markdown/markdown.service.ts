import { inject, Injectable } from '@angular/core';
import { NuLazyService } from '@ng-util/lazy';
import { Observable, Subject } from 'rxjs';
import { NU_MARKDOWN_CONFIG } from './markdown.config';

@Injectable({ providedIn: 'root' })
export class NuMarkdownService {
  private readonly config = inject(NU_MARKDOWN_CONFIG, { optional: true });
  private readonly lazySrv = inject(NuLazyService);
  private libs: string[];
  private loading = false;
  private loaded = false;
  private notify$ = new Subject<void>();

  get notify(): Observable<void> {
    return this.notify$.asObservable();
  }

  constructor() {
    this.libs = this.config?.libs || [
      `https://cdn.jsdelivr.net/npm/vditor/dist/index.min.js`,
      `https://cdn.jsdelivr.net/npm/vditor/dist/index.css`,
    ];
  }

  load(): this {
    if (this.loading) {
      if (this.loaded) {
        this.notify$.next();
      }
      return this;
    }
    this.loading = true;

    const libs = this.libs!;
    this.lazySrv.monitor(libs).subscribe(() => {
      this.loaded = true;
      this.notify$.next();
    });
    this.lazySrv.load(libs);

    return this;
  }
}

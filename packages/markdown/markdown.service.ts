import { Inject, Injectable, Optional } from '@angular/core';
import { NuLazyService } from '@ng-util/lazy';
import { Observable, Subject } from 'rxjs';
import { NuMarkdownConfig, NU_MARKDOWN_CONFIG } from './markdown.config';

@Injectable({ providedIn: 'root' })
export class NuMarkdownService {
  private libs: string[];
  private loading = false;
  private loaded = false;
  private notify$ = new Subject<void>();

  get notify(): Observable<void> {
    return this.notify$.asObservable();
  }

  constructor(
    @Optional() @Inject(NU_MARKDOWN_CONFIG) config: NuMarkdownConfig,
    private lazySrv: NuLazyService,
  ) {
    this.libs = config?.libs || [
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

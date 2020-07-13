import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe } from 'rxjs';
import { filter, share } from 'rxjs/operators';

export interface NuLazyResult {
  path: string;
  status: 'ok' | 'error' | 'loading';
  error?: {};
}

@Injectable({ providedIn: 'root' })
export class NuLazyService {
  private list: { [key: string]: boolean } = {};
  private cached: { [key: string]: NuLazyResult } = {};
  private _notify: BehaviorSubject<NuLazyResult[]> = new BehaviorSubject<NuLazyResult[]>([]);

  constructor(@Inject(DOCUMENT) private doc: any) {}

  /**
   * @deprecated Use `monitor()` method instead, removed it in `11.0.0`
   */
  get change(): Observable<NuLazyResult[]> {
    return this._notify.asObservable().pipe(
      share(),
      filter(ls => ls.length !== 0),
    );
  }

  private fixPaths(paths?: string | string[]): string[] {
    if (typeof paths === 'string') {
      paths = [paths];
    }
    return paths! || [];
  }

  /**
   * Monitor for the finished of `paths`
   *
   * - It's recommended to pass the value in accordance with the `load()` method
   */
  monitor(paths?: string | string[]): Observable<NuLazyResult[]> {
    const libs = this.fixPaths(paths);

    const pipes = [share(), filter((ls: NuLazyResult[]) => ls.length !== 0)];

    if (libs.length > 0) {
      pipes.push(filter((ls: NuLazyResult[]) => ls.length === libs.length && ls.some(v => v.status === 'ok' && libs.includes(v.path))));
    }

    return this._notify.asObservable().pipe(pipe.apply(this, pipes));
  }

  clear(): void {
    this.list = {};
    this.cached = {};
  }

  /**
   * Load the specified resources, includes `.js`, `.css`
   *
   * - The returned Promise does not mean that it was successfully loaded
   * - You can monitor load is success via `monitor()`
   */
  async load(paths: string | string[]): Promise<NuLazyResult[]> {
    paths = this.fixPaths(paths);

    return Promise.all(paths.map(path => (path.endsWith('.js') ? this.loadScript(path) : this.loadStyle(path)))).then(res => {
      this._notify.next(res);
      return Promise.resolve(res);
    });
  }

  loadScript(path: string, options?: { innerContent?: string }): Promise<NuLazyResult> {
    const { innerContent } = { ...options };
    return new Promise(resolve => {
      if (this.list[path] === true) {
        resolve({ ...this.cached[path], status: 'loading' });
        return;
      }

      this.list[path] = true;
      const onSuccess = (item: NuLazyResult) => {
        this.cached[path] = item;
        resolve(item);
        this._notify.next([item]);
      };

      const node = this.doc.createElement('script') as any;
      node.type = 'text/javascript';
      node.src = path;
      node.charset = 'utf-8';
      if (innerContent) {
        node.innerHTML = innerContent;
      }
      if (node.readyState) {
        // IE
        node.onreadystatechange = () => {
          if (node.readyState === 'loaded' || node.readyState === 'complete') {
            node.onreadystatechange = null;
            onSuccess({
              path,
              status: 'ok',
            });
          }
        };
      } else {
        node.onload = () =>
          onSuccess({
            path,
            status: 'ok',
          });
      }
      node.onerror = (error: {}) =>
        onSuccess({
          path,
          status: 'error',
          error,
        });
      this.doc.getElementsByTagName('head')[0].appendChild(node);
    });
  }

  loadStyle(path: string, options?: { rel?: string; innerContent?: string }): Promise<NuLazyResult> {
    const { rel, innerContent } = { rel: 'stylesheet', ...options };
    return new Promise(resolve => {
      if (this.list[path] === true) {
        resolve(this.cached[path]);
        return;
      }

      this.list[path] = true;

      const node = this.doc.createElement('link') as HTMLLinkElement;
      node.rel = rel;
      node.type = 'text/css';
      node.href = path;
      if (innerContent) {
        node.innerHTML = innerContent;
      }
      this.doc.getElementsByTagName('head')[0].appendChild(node);
      const item: NuLazyResult = {
        path,
        status: 'ok',
      };
      this.cached[path] = item;
      resolve(item);
    });
  }
}

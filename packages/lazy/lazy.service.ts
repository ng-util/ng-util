import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  get change(): Observable<NuLazyResult[]> {
    return this._notify.asObservable().pipe(
      share(),
      filter(ls => ls.length !== 0),
    );
  }

  clear(): void {
    this.list = {};
    this.cached = {};
  }

  load(paths: string | string[]): Promise<NuLazyResult[]> {
    if (!Array.isArray(paths)) {
      paths = [paths];
    }

    const promises: Array<Promise<NuLazyResult>> = [];
    paths.forEach(path => {
      if (path.endsWith('.js')) {
        promises.push(this.loadScript(path));
      } else {
        promises.push(this.loadStyle(path));
      }
    });

    return Promise.all(promises).then(res => {
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

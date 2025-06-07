import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe } from 'rxjs';
import { filter, share } from 'rxjs/operators';

export type NuLazyResourcesType = 'script' | 'style';

export interface NuLazyResources {
  path: string;
  type: NuLazyResourcesType;
  /**
   * 回调名称
   */
  callback?: string;
}

export interface NuLazyResult {
  path: string;
  status: 'ok' | 'error' | 'loading';
  type?: NuLazyResourcesType;
  error?: Event | string;
}

@Injectable({ providedIn: 'root' })
export class NuLazyService {
  private readonly doc = inject(DOCUMENT);
  private list: Record<string, boolean> = {};
  private cached: Record<string, NuLazyResult> = {};
  private _notify: BehaviorSubject<NuLazyResult[]> = new BehaviorSubject<NuLazyResult[]>([]);

  private fixPaths(paths?: string | (string | NuLazyResources)[]): NuLazyResources[] {
    paths = paths || [];
    if (!Array.isArray(paths)) {
      paths = [paths];
    }
    return paths.map((p: string | NuLazyResources) => {
      const res = (typeof p === 'string' ? { path: p } : p) as NuLazyResources;
      if (!res.type) {
        res.type = res.path.endsWith('.js') || res.callback ? 'script' : 'style';
      }
      return res;
    });
  }

  /**
   * Monitor for the finished of `paths`
   *
   * - It's recommended to pass the value in accordance with the `load()` method
   */
  monitor(paths?: string | (string | NuLazyResources)[]): Observable<NuLazyResult[]> {
    const libs = this.fixPaths(paths);

    const pipes = [share(), filter((ls: NuLazyResult[]) => ls.length !== 0)];

    if (libs.length > 0) {
      pipes.push(
        filter(
          (ls: NuLazyResult[]) =>
            ls.length === libs.length && ls.every(v => v.status === 'ok' && libs.find(lw => lw.path === v.path))
        )
      );
    }

    return this._notify.asObservable().pipe(pipe.apply(this, pipes as any) as any);
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
  async load(paths: string | (string | NuLazyResources)[]): Promise<NuLazyResult[]> {
    paths = this.fixPaths(paths);

    return Promise.all(
      (paths as NuLazyResources[]).map(p =>
        p.type === 'script' ? this.loadScript(p.path, { callback: p.callback }) : this.loadStyle(p.path)
      )
    ).then(res => {
      this._notify.next(res);
      return Promise.resolve(res);
    });
  }

  loadScript(path: string, options?: { innerContent?: string; callback?: string }): Promise<NuLazyResult> {
    const { innerContent } = { ...options };
    return new Promise(resolve => {
      if (this.list[path] === true) {
        resolve({ ...this.cached[path], status: 'loading' });
        return;
      }

      this.list[path] = true;
      const onSuccess = (item: NuLazyResult): void => {
        if (item.status === 'ok' && options?.callback) {
          (window as any)[options?.callback] = () => {
            onSuccessTruth(item);
          };
        } else {
          onSuccessTruth(item);
        }
      };
      const onSuccessTruth = (item: NuLazyResult): void => {
        item.type = 'script';
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
              status: 'ok'
            });
          }
        };
      } else {
        node.onload = () =>
          onSuccess({
            path,
            status: 'ok'
          });
      }
      node.onerror = (error: Event | string) =>
        onSuccess({
          path,
          status: 'error',
          error
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
        type: 'style'
      };
      this.cached[path] = item;
      resolve(item);
    });
  }
}

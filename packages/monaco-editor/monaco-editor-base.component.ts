import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  booleanAttribute,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  output
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { NuMonacoEditorConfig, NU_MONACO_EDITOR_CONFIG } from './monaco-editor.config';
import { NuMonacoEditorEvent, NuMonacoEditorEventType } from './monaco-editor.types';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'nu-monaco-base',
  template: ``
})
export abstract class NuMonacoEditorBase implements AfterViewInit, OnDestroy {
  protected el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected config = inject(NU_MONACO_EDITOR_CONFIG, { optional: true });
  protected doc = inject(DOCUMENT);
  protected destroy$ = inject(DestroyRef);

  protected _editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  protected _resize$: Subscription | null = null;
  protected _config: NuMonacoEditorConfig;
  protected _disabled?: boolean;

  height = input(`200px`);
  delay = input(0, { transform: numberAttribute });
  disabled = input(false, { transform: booleanAttribute });
  options = input<monaco.editor.IStandaloneEditorConstructionOptions>();
  readonly event = output<NuMonacoEditorEvent>();

  constructor() {
    this._config = { baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor/min', autoFormatTime: 100, ...this.config };

    effect(() => {
      this.setDisabled(this.disabled());
    });

    effect(() => {
      const options = this.options();
      this.updateOptions(options);
    });
  }

  protected abstract initMonaco(
    _options: monaco.editor.IStandaloneEditorConstructionOptions | undefined,
    _initEvent: boolean
  ): void;

  protected notifyEvent(type: NuMonacoEditorEventType, other?: NuMonacoEditorEvent): void {
    this.event.emit({ type, editor: this._editor!, ...other });
  }

  protected setDisabled(v: boolean): this {
    (this._editor as monaco.editor.IStandaloneCodeEditor)?.updateOptions({ readOnly: v });
    return this;
  }

  private init(): void {
    if (loadedMonaco) {
      loadPromise.then(() => this.initMonaco(this.options(), true));
      return;
    }

    loadedMonaco = true;
    loadPromise = new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
      const win: any = window;
      if (win == null) {
        resolve();
        return;
      }

      if (win.monaco) {
        resolve();
        return;
      }

      let baseUrl = `${this._config.baseUrl}/vs`;
      // fix: https://github.com/microsoft/monaco-editor/issues/4778
      if (!/^https?:\/\//g.test(baseUrl)) {
        baseUrl = `${window.location.origin}/${baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl}`;
      }
      const amdLoader = () => {
        win.require.config({
          paths: {
            vs: baseUrl
          }
        });
        if (typeof this._config.monacoPreLoad === 'function') {
          this._config.monacoPreLoad();
        }
        win.require(
          ['vs/editor/editor.main'],
          () => {
            if (typeof this._config.monacoLoad === 'function') {
              this._config.monacoLoad(win.monaco);
            }
            this.initMonaco(this.options(), true);
            resolve();
          },
          () => {
            reject(`Unable to load editor/editor.main module, please check your network environment.`);
          }
        );
      };

      if (!win.require) {
        const loaderScript = this.doc.createElement('script') as HTMLScriptElement;
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/loader.js`;
        loaderScript.onload = amdLoader;
        loaderScript.onerror = () =>
          reject(`Unable to load ${loaderScript.src}, please check your network environment.`);
        this.doc.getElementsByTagName('head')[0].appendChild(loaderScript);
      } else {
        amdLoader();
      }
    }).catch(error => this.notifyEvent('load-error', { error }));
  }

  protected cleanResize(): this {
    this._resize$?.unsubscribe();
    return this;
  }

  protected registerResize(): this {
    this.cleanResize();
    this._resize$ = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => {
        this._editor!.layout();
        this.notifyEvent('resize');
      });
    return this;
  }

  updateOptions(v: monaco.editor.IStandaloneEditorConstructionOptions | undefined): void {
    if (!this._editor) return;
    this._editor!.dispose();
    this.initMonaco(v, false);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), +this.delay());
  }

  ngOnDestroy(): void {
    this.cleanResize();
    this._editor?.dispose();
  }
}

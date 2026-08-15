import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subscription, timer } from 'rxjs';

import { debounceTime } from 'rxjs/operators';

import { NuMonacoEditorConfig, NU_MONACO_EDITOR_CONFIG } from './monaco-editor.config';
import { NuMonacoEditorEvent, NuMonacoEditorEventType } from './monaco-editor.types';

let monacoLoadPromise: Promise<void> | null = null;

@Component({
  selector: 'nu-monaco-base',
  template: ``
})
export abstract class NuMonacoEditorBase implements OnDestroy {
  protected el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected config = inject(NU_MONACO_EDITOR_CONFIG, { optional: true });
  protected doc = inject(DOCUMENT);
  protected destroy$ = inject(DestroyRef);

  protected _editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  protected _resize$: Subscription | null = null;
  protected _config: NuMonacoEditorConfig;
  protected _disabled?: boolean;
  protected readonly _disposables: monaco.IDisposable[] = [];

  readonly height = input(`200px`);
  readonly delay = input(0, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly options = input<monaco.editor.IStandaloneEditorConstructionOptions>();
  readonly event = output<NuMonacoEditorEvent>();

  constructor() {
    this._config = { baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor/min', autoFormatTime: 100, ...this.config };

    effect(() => {
      this.setDisabled(this.disabled());
    });

    effect(() => {
      const options = this.options();
      this.height();
      this.updateOptions(options);
    });

    afterNextRender(() => {
      timer(this.delay())
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe(() => this.init());
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
    if (typeof window === 'undefined') return;

    if (!monacoLoadPromise) {
      monacoLoadPromise = new Promise<void>((resolve: () => void, reject: (err: string) => void) => {
        const windowRef = window as any;
        if (windowRef.monaco) {
          resolve();
          return;
        }

        let baseUrl = `${this._config.baseUrl}/vs`;
        // fix: https://github.com/microsoft/monaco-editor/issues/4778
        if (!/^https?:\/\//.test(baseUrl)) {
          baseUrl = `${window.location.origin}/${baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl}`;
        }
        const amdLoader = (): void => {
          windowRef.require.config({
            paths: {
              vs: baseUrl
            }
          });
          if (typeof this._config.monacoPreLoad === 'function') {
            this._config.monacoPreLoad();
          }
          windowRef.require(
            ['vs/editor/editor.main'],
            () => {
              if (typeof this._config.monacoLoad === 'function') {
                this._config.monacoLoad(windowRef.monaco);
              }
              resolve();
            },
            () => {
              reject(`Unable to load editor/editor.main module, please check your network environment.`);
            }
          );
        };

        if (!windowRef.require) {
          const loaderScript = this.doc.createElement('script') as HTMLScriptElement;
          loaderScript.type = 'text/javascript';
          loaderScript.src = `${baseUrl}/loader.js`;
          loaderScript.onload = amdLoader;
          loaderScript.onerror = () => {
            reject(`Unable to load ${loaderScript.src}, please check your network environment.`);
          };
          this.doc.getElementsByTagName('head')[0].appendChild(loaderScript);
        } else {
          amdLoader();
        }
      }).catch(error => {
        monacoLoadPromise = null;
        throw error;
      });
    }

    monacoLoadPromise
      .then(() => this.initMonaco(this.options(), true))
      .catch(error => this.notifyEvent('load-error', { error }));
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
        this._editor?.layout();
        this.notifyEvent('resize');
      });
    return this;
  }

  protected disposeEditor(): this {
    this._disposables.forEach(d => d.dispose());
    this._disposables.length = 0;
    this._editor?.dispose();
    this._editor = undefined;
    return this;
  }

  updateOptions(v: monaco.editor.IStandaloneEditorConstructionOptions | undefined): void {
    if (!this._editor) return;

    this.disposeEditor();
    this.initMonaco(v, false);
  }

  ngOnDestroy(): void {
    this.cleanResize();
    this.disposeEditor();
  }
}

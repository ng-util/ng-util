import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NuMonacoEditorConfig, NU_MONACO_EDITOR_CONFIG } from './monaco-editor.config';
import { NuMonacoEditorEvent, NuMonacoEditorEventType } from './monaco-editor.types';

let loadedMonaco = false;
let loadPromise: Promise<void>;

export abstract class NuMonacoEditorBase implements AfterViewInit, OnChanges, OnDestroy {
  protected _editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  protected _options: monaco.editor.IStandaloneEditorConstructionOptions;
  protected _resize$: Subscription;
  protected _config: NuMonacoEditorConfig;

  @Input() height = 200;
  @Input() disabled = false;
  @Input()
  set options(val: monaco.editor.IStandaloneEditorConstructionOptions) {
    this._options = { ...this._config.defaultOptions, ...val };
  }
  get options() {
    return this._options;
  }
  @Output() event = new EventEmitter<NuMonacoEditorEvent>();

  constructor(
    protected el: ElementRef<HTMLElement>,
    @Inject(NU_MONACO_EDITOR_CONFIG) config: NuMonacoEditorConfig,
    @Inject(DOCUMENT) protected doc: any,
    protected ngZone: NgZone,
  ) {
    // https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs/base/worker/workerMain.min.js
    this._config = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min', ...config };
    this.options = this._config.defaultOptions!;
  }

  protected abstract initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions): void;

  protected notifyEvent(type: NuMonacoEditorEventType): void {
    this.event.emit({ type, editor: this._editor! });
  }

  protected setDisabled(): this {
    if (this._editor) {
      this._editor.updateOptions({ readOnly: this.disabled });
    }
    return this;
  }

  private init(): void {
    if (loadedMonaco) {
      loadPromise.then(() => this.initMonaco(this.options));
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

      const baseUrl = this._config.baseUrl;
      const amdLoader = () => {
        win.require.config({ paths: { vs: `${baseUrl}/vs` } });
        win.require(
          ['vs/editor/editor.main'],
          () => {
            if (typeof this._config.monacoLoad === 'function') {
              this._config.monacoLoad(win.monaco);
            }
            this.initMonaco(this.options);
            resolve();
          },
          () => {
            reject(`Unable to load editor/editor.main module, please check your network environment.`);
          },
        );
      };

      if (!win.require) {
        const loaderScript = this.doc.createElement('script') as HTMLScriptElement;
        loaderScript.type = 'text/javascript';
        loaderScript.src = `${baseUrl}/vs/loader.js`;
        loaderScript.addEventListener('load', amdLoader);
        loaderScript.addEventListener('error', () => reject(`Unable to load ${loaderScript.src}, please check your network environment.`));
        this.doc.body.appendChild(loaderScript);
      } else {
        amdLoader();
      }
    }).catch(error => this.event.emit({ type: 'load-error', error }));
  }

  protected cleanResize(): this {
    if (this._resize$) {
      this._resize$.unsubscribe();
    }
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

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.init());
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {
    if (this._editor) {
      if (Object.keys(changes).length === 1 && changes.disabled) {
        this.setDisabled();
        return;
      }
      this._editor.dispose();
      this.initMonaco(this._options);
    }
  }

  ngOnDestroy(): void {
    this.cleanResize();
    if (this._editor) {
      this._editor.dispose();
      this._editor = undefined;
    }
  }
}

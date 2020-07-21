import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
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

@Component({
  selector: 'nu-monaco-base',
  template: ``,
})
// tslint:disable-next-line: component-class-suffix
export class NuMonacoEditorBase implements AfterViewInit, OnChanges, OnDestroy {
  protected _editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  protected _options: monaco.editor.IStandaloneEditorConstructionOptions;
  protected _resize$: Subscription;
  protected _config: NuMonacoEditorConfig;
  protected _disabled = false;

  @Input() height = `200px`;
  @Input() delay = 0;
  @Input()
  set disabled(val: boolean | string) {
    this._disabled = typeof val === 'string' ? true : val;
    this.setDisabled();
  }
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
    this._config = { baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min', ...config };
    this.options = this._config.defaultOptions!;
  }

  protected initMonaco(_options: monaco.editor.IStandaloneEditorConstructionOptions, _initEvent: boolean): void {}

  protected notifyEvent(type: NuMonacoEditorEventType, other?: NuMonacoEditorEvent): void {
    this.ngZone.run(() => this.event.emit({ type, editor: this._editor!, ...other }));
  }

  protected setDisabled(): this {
    if (this._editor) {
      (this._editor as monaco.editor.IStandaloneCodeEditor).updateOptions({ readOnly: this._disabled });
    }
    return this;
  }

  private init(): void {
    if (loadedMonaco) {
      loadPromise.then(() => this.initMonaco(this.options, true));
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
            this.initMonaco(this.options, true);
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
        loaderScript.onload = amdLoader;
        loaderScript.onerror = () => reject(`Unable to load ${loaderScript.src}, please check your network environment.`);
        this.doc.getElementsByTagName('head')[0].appendChild(loaderScript);
      } else {
        amdLoader();
      }
    }).catch(error => this.notifyEvent('load-error', { error }));
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

  protected updateOptions(): void {
    if (!this._editor) return;
    this.ngZone.runOutsideAngular(() => {
      this._editor!.dispose();
      this.initMonaco(this._options, false);
    });
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => setTimeout(() => this.init(), +this.delay));
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {
    const allKeys = Object.keys(changes);
    if (allKeys.length === 1 && allKeys[0] === 'disabled') return;
    this.updateOptions();
  }

  ngOnDestroy(): void {
    this.cleanResize();
    if (this._editor) {
      this._editor.dispose();
      this._editor = undefined;
    }
  }
}

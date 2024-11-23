import {
  AfterViewInit,
  booleanAttribute,
  Directive,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NU_MARKDOWN_CONFIG } from './markdown.config';
import { NuMarkdownService } from './markdown.service';

@Directive()
export abstract class NuMarkdownBaseComponent implements AfterViewInit, OnDestroy {
  protected el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected config = inject(NU_MARKDOWN_CONFIG, { optional: true });
  protected srv = inject(NuMarkdownService);
  protected ngZone = inject(NgZone);

  private notify$?: Subscription;
  protected _instance: any;

  @Input({ transform: numberAttribute }) delay = 0;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input() options: any;
  @Output() readonly ready = new EventEmitter<string>();

  protected _value!: string;
  @Input()
  set value(v: string) {
    this._value = v;
    if (this.loaded) {
      this.init();
    }
  }

  get instance(): any {
    return this._instance;
  }

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay);
  }

  protected abstract init(): void;

  protected get loaded(): boolean {
    return !!(window as any).Vditor;
  }

  ngAfterViewInit(): void {
    this.notify$ = this.srv.notify.subscribe(() => this.initDelay());
    if (this.loaded) {
      this.initDelay();
      return;
    }
    this.srv.load();
  }

  ngOnDestroy(): void {
    this.notify$?.unsubscribe();
  }
}

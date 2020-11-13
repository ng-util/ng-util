import { AfterViewInit, Directive, ElementRef, Inject, Input, NgZone, OnDestroy } from '@angular/core';
import { InputNumber } from '@ng-util/util/convert';
import { Subscription } from 'rxjs';
import { NuMarkdownConfig, NU_MARKDOWN_CONFIG } from './markdown.config';
import { NuMarkdownService } from './markdown.service';

@Directive()
export abstract class NuMarkdownBaseComponent implements AfterViewInit, OnDestroy {
  private notify$: Subscription;
  protected _instance: any;

  @Input() @InputNumber() delay: number;

  get instance(): any {
    return this._instance;
  }

  constructor(
    protected el: ElementRef<HTMLElement>,
    @Inject(NU_MARKDOWN_CONFIG) protected config: NuMarkdownConfig,
    protected srv: NuMarkdownService,
    protected ngZone: NgZone,
  ) {
    this.notify$ = this.srv.notify.subscribe(() => this.initDelay());
  }

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay);
  }

  protected abstract init(): void;

  protected get loaded(): boolean {
    return !!(window as any).Vditor;
  }

  ngAfterViewInit(): void {
    if (this.loaded) {
      this.initDelay();
      return;
    }
    this.srv.load();
  }

  ngOnDestroy(): void {
    this.notify$.unsubscribe();
  }
}

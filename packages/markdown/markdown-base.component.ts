import {
  AfterViewInit,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs';
import type VditorType from 'vditor';

import { NU_MARKDOWN_CONFIG } from './markdown.config';
import { NuMarkdownService } from './markdown.service';

@Directive()
export abstract class NuMarkdownBaseComponent implements AfterViewInit, OnDestroy {
  protected el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected config = inject(NU_MARKDOWN_CONFIG, { optional: true });
  protected srv = inject(NuMarkdownService);

  private notify$?: Subscription;
  protected _instance?: VditorType;

  delay = input(0, { transform: numberAttribute });
  disabled = input(false, { transform: booleanAttribute });

  get instance(): VditorType | undefined {
    return this._instance;
  }

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay());
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

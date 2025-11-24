import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute
} from '@angular/core';
import type VditorType from 'vditor';
import { NU_MARKDOWN_CONFIG } from './markdown.config';
import { NuMarkdownService } from './markdown.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive()
export abstract class NuMarkdownBaseComponent {
  protected el = inject<ElementRef<HTMLElement>>(ElementRef);
  protected config = inject(NU_MARKDOWN_CONFIG, { optional: true });
  protected srv = inject(NuMarkdownService);

  protected _instance?: VditorType;

  delay = input(0, { transform: numberAttribute });
  disabled = input(false, { transform: booleanAttribute });

  get instance(): VditorType | undefined {
    return this._instance;
  }

  constructor() {
    this.srv.notify.pipe(takeUntilDestroyed()).subscribe(() => this.initDelay());

    afterNextRender(() => {
      if (this.loaded) {
        this.initDelay();
        return;
      }
      this.srv.load();
    });
  }

  private initDelay(): void {
    setTimeout(() => this.init(), this.delay());
  }

  protected abstract init(): void;

  protected get loaded(): boolean {
    return !!(window as any).Vditor;
  }
}

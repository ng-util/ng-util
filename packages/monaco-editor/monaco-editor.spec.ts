import { Component, provideZonelessChangeDetection, signal, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { NuMonacoEditorDiffComponent } from './monaco-editor-diff.component';
import { NuMonacoEditorComponent } from './monaco-editor.component';
import { provideNuMonacoEditorConfig } from './monaco-editor.config';
import { NuMonacoEditorDiffModel, NuMonacoEditorEvent, NuMonacoEditorModel } from './monaco-editor.types';

const FIX_LOAD_LIB_TIME = 1000 * 1;

const delay = (ms?: number): Promise<void> => new Promise(res => setTimeout(res, ms ?? FIX_LOAD_LIB_TIME));

/**
 * jsdom 环境无法真实加载 monaco-editor（AMD/CDN 资源），
 * 因此在测试前注入一个最小可用的 monaco mock，让组件走完整的初始化逻辑。
 */
function createMockModel(value = '', language = 'plaintext'): any {
  let current = String(value ?? '');
  const listeners: Array<() => void> = [];
  return {
    getValue: () => current,
    setValue: (v: string) => {
      current = String(v ?? '');
      listeners.forEach(cb => cb());
    },
    getLanguageId: () => language,
    onDidChangeContent: (cb: () => void) => {
      listeners.push(cb);
      return { dispose: () => {} };
    }
  };
}

function createMockEditor(opts: { model?: any } = {}): any {
  const initialValue = opts.model?.getValue ? opts.model.getValue() : '';
  const state = {
    value: initialValue,
    contentHeight: Math.max(initialValue.split('\n').length * 20, 20),
    height: 0
  };
  const listeners: Record<string, Array<(...args: any[]) => void>> = {};
  const on = (name: string) => (cb: (...args: any[]) => void) => {
    (listeners[name] ??= []).push(cb);
    return { dispose: () => {} };
  };
  return {
    state,
    setValue: (v: string) => {
      state.value = String(v ?? '');
      state.contentHeight = Math.max(state.value.split('\n').length * 20, 20);
      listeners['onDidChangeModelContent']?.forEach(cb => cb());
      listeners['onDidContentSizeChange']?.forEach(cb => cb());
    },
    getValue: () => state.value,
    getContentHeight: () => state.contentHeight,
    getLayoutInfo: () => ({ width: 800, height: state.height }),
    layout: (dims?: { width?: number; height?: number }) => {
      if (dims?.height != null) state.height = dims.height;
    },
    getAction: () => ({ run: () => Promise.resolve() }),
    getModel: () => null,
    setModel: () => {},
    onDidChangeModelContent: on('onDidChangeModelContent'),
    onDidContentSizeChange: on('onDidContentSizeChange'),
    onDidBlurEditorWidget: on('onDidBlurEditorWidget'),
    onDidUpdateDiff: on('onDidUpdateDiff'),
    addContentWidget: () => {},
    removeContentWidget: () => {},
    applyFontInfo: () => {},
    updateOptions: () => {},
    dispose: () => {},
    getModifiedEditor: () => null
  };
}

const mockMonaco = {
  editor: {
    create: (el: HTMLElement, options: any) => createMockEditor({ model: options?.model }),
    createDiffEditor: () => createMockEditor(),
    createModel: (value: string, language?: string) => createMockModel(value, language),
    getModel: () => null,
    setTheme: () => {},
    ContentWidgetPositionPreference: { EXACT: 0 }
  }
} as any;

describe('ng-util: monaco-editor', () => {
  beforeEach(() => {
    (window as any).monaco = mockMonaco;
  });

  function create<T>(comp: Type<T>, option: { html?: string } = {}): ComponentFixture<T> {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideNuMonacoEditorConfig({ baseUrl: `monaco-editor/min` })],
      imports: [TestComponent, TestDiffComponent]
    });
    if (option.html != null) TestBed.overrideTemplate(comp, option.html);
    return TestBed.createComponent(comp);
  }

  describe('editor', () => {
    it('should be working', async () => {
      const fixture = create(TestComponent);
      fixture.componentInstance.options = { readOnly: true };
      const changeSpy = vi.spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.mock.calls[0][0].type).toBe(`init`);
    });
    it('#disabled', async () => {
      const fixture = create(TestComponent);
      await fixture.whenStable();
      await delay();
      const editorSpy = vi.spyOn(fixture.componentInstance.comp.editor!, 'updateOptions');
      fixture.componentInstance.disabled.set(true);
      await fixture.whenStable();
      expect(editorSpy).toHaveBeenCalled();
    });
    it('#auto height', async () => {
      const fixture = create(TestComponent);
      fixture.componentInstance.height = 'auto';
      await fixture.whenStable();
      await delay();
      const editor = fixture.componentInstance.comp.editor;
      const lastHeight = editor?.getLayoutInfo().height ?? 0;
      expect(lastHeight).toBeGreaterThan(0);
      editor!.setValue(
        Array(100)
          .fill(0)
          .map((_, i) => `Line ${i + 1}`)
          .join('\n')
      );
      await delay();
      expect(editor?.getLayoutInfo().height ?? 0).toBeGreaterThan(lastHeight);
    });
    it('#min-height', async () => {
      const fixture = create(TestComponent);
      const minHeight = 118;
      fixture.componentInstance.height = 'auto';
      fixture.componentInstance.minHeight = minHeight;
      await fixture.whenStable();
      await delay();
      expect(fixture.componentInstance.comp.editor?.getLayoutInfo().height ?? 0).toBe(minHeight);
    });
    it('#max-height', async () => {
      const fixture = create(TestComponent);
      const maxHeight = 100;
      fixture.componentInstance.height = 'auto';
      fixture.componentInstance.maxHeight = maxHeight;
      await fixture.whenStable();
      await delay();
      const editor = fixture.componentInstance.comp.editor;
      editor!.setValue(
        Array(100)
          .fill(0)
          .map((_, i) => `Line ${i + 1}`)
          .join('\n')
      );
      await delay();
      expect(editor?.getLayoutInfo().height ?? 0).toBe(maxHeight);
    });
  });

  describe('diff', () => {
    it('should be working', async () => {
      const fixture = create(TestDiffComponent);
      fixture.componentInstance.options = { readOnly: true };
      const changeSpy = vi.spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.mock.calls[0][0].type).toBe(`init`);
    });
    it('should be throw error when new is null', async () => {
      const fixture = create(TestDiffComponent);
      fixture.componentInstance.newModel = null;
      const changeSpy = vi.spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.mock.calls[0][0].type).toBe(`error`);
      expect(fixture.componentInstance.comp.editor == null).toBe(true);
    });
  });
});

@Component({
  template: `
    <nu-monaco-editor
      #comp
      [(ngModel)]="value"
      [model]="model"
      [options]="options"
      [height]="height"
      [minHeight]="minHeight"
      [maxHeight]="maxHeight"
      [delay]="delay"
      [disabled]="disabled()"
      [autoFormat]="autoFormat"
      (event)="onChange($event)"
    />
  `,
  imports: [FormsModule, NuMonacoEditorComponent]
})
class TestComponent {
  @ViewChild('comp') comp!: NuMonacoEditorComponent;
  options: monaco.editor.IStandaloneEditorConstructionOptions = { theme: 'vs', readOnly: true };
  model: NuMonacoEditorModel = {
    value: '<h1>Title</h1>',
    language: 'html'
  };
  height = '100px';
  minHeight?: number;
  maxHeight?: number;
  delay = 0;
  disabled = signal(false);
  autoFormat = true;
  value?: string | null = null;
  onChange(_: NuMonacoEditorEvent): void {}
}

@Component({
  template: `
    <nu-monaco-diff-editor
      #comp
      [old]="oldModel"
      [new]="newModel"
      [options]="options"
      [height]="height"
      [delay]="delay"
      [disabled]="disabled"
      (event)="onChange($event)"
    />
  `,
  imports: [FormsModule, NuMonacoEditorDiffComponent]
})
class TestDiffComponent {
  @ViewChild('comp') comp!: NuMonacoEditorDiffComponent;
  options: monaco.editor.IStandaloneEditorConstructionOptions = { theme: 'vs', readOnly: true };
  oldModel: NuMonacoEditorDiffModel = {
    code: 'const a = 1;',
    language: 'typescript'
  };
  newModel?: NuMonacoEditorDiffModel | null = {
    code: 'const a = 2;',
    language: 'typescript'
  };
  height = '100px';
  delay = 0;
  disabled = false;
  onChange(_: NuMonacoEditorEvent): void {}
}

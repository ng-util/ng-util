import { Component, provideZonelessChangeDetection, signal, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { NuMonacoEditorDiffComponent } from './monaco-editor-diff.component';
import { NuMonacoEditorComponent } from './monaco-editor.component';
import { provideNuMonacoEditorConfig } from './monaco-editor.config';
import { NuMonacoEditorDiffModel, NuMonacoEditorEvent, NuMonacoEditorModel } from './monaco-editor.types';

const FIX_LOAD_LIB_TIME = 1000 * 1;

const delay = (ms?: number) => new Promise(res => setTimeout(res, ms ?? FIX_LOAD_LIB_TIME));

describe('ng-util: monaco-editor', () => {
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
      const changeSpy = spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.calls.first().args[0].type).toBe(`init`);
    });
    it('#disabled', async () => {
      const fixture = create(TestComponent);
      await fixture.whenStable();
      await delay();
      const editorSpy = spyOn(fixture.componentInstance.comp.editor!, 'updateOptions');
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
  });

  describe('diff', () => {
    it('should be working', async () => {
      const fixture = create(TestDiffComponent);
      fixture.componentInstance.options = { readOnly: true };
      const changeSpy = spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.calls.first().args[0].type).toBe(`init`);
    });
    it('should be throw error when new is null', async () => {
      const fixture = create(TestDiffComponent);
      fixture.componentInstance.newModel = null;
      const changeSpy = spyOn(fixture.componentInstance, 'onChange');
      await fixture.whenStable();
      await delay();
      expect(changeSpy).toHaveBeenCalled();
      expect(changeSpy.calls.first().args[0].type).toBe(`error`);
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

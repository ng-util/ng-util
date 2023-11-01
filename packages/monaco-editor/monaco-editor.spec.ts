import { Component, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuMonacoEditorDiffComponent } from './monaco-editor-diff.component';
import { NuMonacoEditorComponent } from './monaco-editor.component';
import { NuMonacoEditorModule } from './monaco-editor.module';
import { NuMonacoEditorDiffModel, NuMonacoEditorEvent, NuMonacoEditorModel } from './monaco-editor.types';

const FIX_LOAD_LIB_TIME = 1000 * 1;

describe('ng-util: monaco-editor', () => {
  function create<T>(comp: Type<T>, option: { html?: string } = {}): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        NuMonacoEditorModule.forRoot({
          baseUrl: `monaco-editor/min`,
        }),
      ],
      declarations: [TestComponent, TestDiffComponent],
    });
    if (option.html != null) TestBed.overrideTemplate(comp, option.html);
    return TestBed.createComponent(comp);
  }

  describe('editor', () => {
    it('should be working', (done) => {
      const fixture = create(TestComponent);
      fixture.componentInstance.options = { readOnly: true };
      const changeSpy = spyOn(fixture.componentInstance, 'onChange');
      fixture.detectChanges();
      setTimeout(() => {
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.calls.first().args[0].type).toBe(`init`);
        done();
      }, FIX_LOAD_LIB_TIME);
    });
    it('#disabled', (done) => {
      const fixture = create(TestComponent);
      fixture.detectChanges();
      setTimeout(() => {
        const editorSpy = spyOn(fixture.componentInstance.comp.editor, 'updateOptions');
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();
        expect(editorSpy).toHaveBeenCalled();
        done();
      }, FIX_LOAD_LIB_TIME);
    });
  });

  describe('diff', () => {
    it('should be working', (done) => {
      const fixture = create(TestDiffComponent);
      fixture.componentInstance.options = { readOnly: true };
      const changeSpy = spyOn(fixture.componentInstance, 'onChange');
      fixture.detectChanges();
      setTimeout(() => {
        expect(changeSpy).toHaveBeenCalled();
        expect(changeSpy.calls.first().args[0].type).toBe(`init`);
        done();
      }, FIX_LOAD_LIB_TIME);
    });
  });
});

@Component({
  template: `
    <nu-monaco-editor
      #comp
      [model]="model"
      [options]="options"
      [height]="height"
      [delay]="delay"
      [disabled]="disabled"
      [autoFormat]="autoFormat"
      (event)="onChange($event)"
    ></nu-monaco-editor>
  `,
})
class TestComponent {
  @ViewChild('comp') comp!: NuMonacoEditorComponent;
  options: monaco.editor.IStandaloneEditorConstructionOptions = { theme: 'vs', readOnly: true };
  model: NuMonacoEditorModel = {
    value: '<h1>Title</h1>',
    language: 'html',
  };
  height = '100px';
  delay = 0;
  disabled = false;
  autoFormat = true;
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
    ></nu-monaco-diff-editor>
  `,
})
class TestDiffComponent {
  @ViewChild('comp') comp!: NuMonacoEditorDiffComponent;
  options: monaco.editor.IStandaloneEditorConstructionOptions = { theme: 'vs', readOnly: true };
  oldModel: NuMonacoEditorDiffModel = {
    code: 'const a = 1;',
    language: 'typescript',
  };
  newModel: NuMonacoEditorDiffModel = {
    code: 'const a = 2;',
    language: 'typescript',
  };
  height = '100px';
  delay = 0;
  disabled = false;
  onChange(_: NuMonacoEditorEvent): void {}
}

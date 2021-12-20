import { Component, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuMonacoEditorDiffComponent } from './monaco-editor-diff.component';
import { NuMonacoEditorComponent } from './monaco-editor.component';
import { NuMonacoEditorModule } from './monaco-editor.module';
import { NuMonacoEditorDiffModel, NuMonacoEditorEvent, NuMonacoEditorModel } from './monaco-editor.types';

const FIX_LOAD_LIB_TIME = 1000 * 3;

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

  xit('should be working', done => {
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
});

@Component({
  template: ` <nu-monaco-editor #comp [model]="model" [options]="options" (event)="onChange($event)"></nu-monaco-editor> `,
})
class TestComponent {
  @ViewChild('comp') comp!: NuMonacoEditorComponent;
  options: monaco.editor.IStandaloneEditorConstructionOptions = { theme: 'vs', readOnly: true };
  model: NuMonacoEditorModel = {
    value: '<h1>Title</h1>',
    language: 'html',
  };
  onChange(_: NuMonacoEditorEvent): void {}
}

@Component({
  template: `
    <nu-monaco-diff-editor #comp [old]="oldModel" [new]="newModel" [options]="options" (event)="onChange($event)"></nu-monaco-diff-editor>
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
  onChange(_: NuMonacoEditorEvent): void {}
}

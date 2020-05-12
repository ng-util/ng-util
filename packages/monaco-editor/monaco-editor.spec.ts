import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

describe('ng-util: monaco-editor', () => {
  let fixture: ComponentFixture<TestComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NuMonacoEditorModule.forRoot()],
      declarations: [TestComponent],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('should be working', () => {
    expect(true).toBe(true);
  });
});

@Component({
  template: ` <nu-monaco-editor [(ngModel)]="value" [options]="editorOptions"></nu-monaco-editor> `,
})
class TestComponent {
  value = `const a = 1;`;
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
}

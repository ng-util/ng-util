// tslint:disable-next-line: no-reference
/// <reference path="./monaco.d.ts" />

export interface NuMonacoEditorModel {
  language?: string;
  uri?: monaco.Uri;
}

export interface NuMonacoEditorDiffModel {
  code: string;
  language?: string;
}

export type NuMonacoEditorEventType = 'load-error' | 'init' | 're-init' | 'resize' | 'update-diff';

export interface NuMonacoEditorEvent {
  type?: NuMonacoEditorEventType;
  editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  error?: string;
  /** Just only `nu-monaco-editor-diff` component */
  diffValue?: string;
}

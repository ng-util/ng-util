// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./monaco.d.ts" preserve="true" />

export interface NuMonacoEditorModel {
  value?: string;
  language?: string;
  uri?: monaco.Uri;
}

export interface NuMonacoEditorDiffModel {
  code: string;
  language?: string;
}

export type NuMonacoEditorEventType = 'load-error' | 'init' | 're-init' | 'resize' | 'update-diff' | 'error';

export interface NuMonacoEditorEvent {
  type?: NuMonacoEditorEventType;
  editor?: monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;
  error?: string;
  /** Just only `nu-monaco-editor-diff` component */
  diffValue?: string;
}

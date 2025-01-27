export class PlaceholderWidget implements monaco.editor.IContentWidget {
  private readonly ID = 'editor.widget.placeholderHint';
  private placeholder?: string;
  private editor: monaco.editor.IStandaloneCodeEditor;
  private node?: HTMLElement;

  constructor(editor: monaco.editor.IStandaloneCodeEditor, placeholder?: string) {
    this.placeholder = placeholder;
    this.editor = editor;
  }

  update(text?: string | null | undefined) {
    if (this.node == null) return;

    this.node.innerHTML = text ?? this.placeholder ?? '';
  }

  getId(): string {
    return this.ID;
  }
  getDomNode(): HTMLElement {
    if (this.node == null) {
      const node = (this.node = document.createElement('div'));
      node.classList.add('monaco-editor-placeholder');
      node.style.width = 'max-content';
      node.style.color = 'gray';
      node.innerHTML = this.placeholder!;
      node.style.fontStyle = 'italic';
      this.editor.applyFontInfo(node);
    }
    return this.node;
  }
  getPosition(): monaco.editor.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 1, column: 1 },
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
    };
  }

  dispose() {
    this.editor.removeContentWidget(this);
  }
}

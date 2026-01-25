import { useCallback, type ReactElement } from "react";
import { DecoratorNode, $getNodeByKey } from "lexical";
import type {
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import CodeMirrorEditor from "@/shared/ui/CodeMirrorEditor";

export type SerializedCodeMirrorNode = Spread<
  {
    code: string;
    language: string;
  },
  SerializedLexicalNode
>;

function CodeMirrorComponent({
  code,
  language,
  nodeKey,
}: {
  code: string;
  language: string;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  useLexicalNodeSelection(nodeKey);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCodeMirrorNode(node)) {
          node.setCode(newCode);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isCodeMirrorNode(node)) {
          node.setLanguage(newLang);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleRemove = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  return (
    <CodeMirrorEditor
      code={code}
      language={language}
      onChange={handleCodeChange}
      onLanguageChange={handleLanguageChange}
      onRemove={handleRemove}
    />
  );
}

export class CodeMirrorNode extends DecoratorNode<ReactElement> {
  __code: string;
  __language: string;

  static getType(): string {
    return "codemirror";
  }

  static clone(node: CodeMirrorNode): CodeMirrorNode {
    return new CodeMirrorNode(node.__code, node.__language, node.__key);
  }

  constructor(
    code: string = "",
    language: string = "javascript",
    key?: NodeKey,
  ) {
    super(key);
    this.__code = code;
    this.__language = language;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "codemirror-block-wrapper";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getCode(): string {
    return this.__code;
  }

  setCode(code: string): void {
    const writable = this.getWritable();
    writable.__code = code;
  }

  getLanguage(): string {
    return this.__language;
  }

  setLanguage(language: string): void {
    const writable = this.getWritable();
    writable.__language = language;
  }

  decorate(): ReactElement {
    return (
      <CodeMirrorComponent
        code={this.__code}
        language={this.__language}
        nodeKey={this.__key}
      />
    );
  }

  static importJSON(serializedNode: SerializedCodeMirrorNode): CodeMirrorNode {
    const { code, language } = serializedNode;
    return $createCodeMirrorNode(code, language);
  }

  exportJSON(): SerializedCodeMirrorNode {
    return {
      code: this.__code,
      language: this.__language,
      type: "codemirror",
      version: 1,
    };
  }

  getTextContent(): string {
    return `\`\`\`${this.__language}\n${this.__code}\n\`\`\``;
  }

  isEmpty(): boolean {
    return this.__code.length === 0;
  }

  isInline(): false {
    return false;
  }
}

export function $createCodeMirrorNode(
  code: string = "",
  language: string = "javascript",
): CodeMirrorNode {
  return new CodeMirrorNode(code, language);
}

export function $isCodeMirrorNode(
  node: LexicalNode | null | undefined,
): node is CodeMirrorNode {
  return node instanceof CodeMirrorNode;
}

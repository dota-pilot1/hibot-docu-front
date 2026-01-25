import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface CodeMirrorEditorProps {
  code: string;
  language: string;
  onChange: (value: string) => void;
  onLanguageChange: (lang: string) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "shell", label: "Shell" },
];

function getLanguageExtension(lang: string) {
  switch (lang) {
    case "javascript":
      return javascript();
    case "typescript":
      return javascript({ typescript: true });
    case "python":
      return python();
    case "java":
      return java();
    case "html":
      return html();
    case "css":
      return css();
    case "json":
      return json();
    case "sql":
      return sql();
    case "markdown":
      return markdown();
    default:
      return javascript();
  }
}

export default function CodeMirrorEditor({
  code,
  language,
  onChange,
  onLanguageChange,
  onRemove,
  readOnly = false,
}: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const lineCount = code.split("\n").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  useEffect(() => {
    if (!editorRef.current || isCollapsed) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
      if (update.focusChanged) {
        setIsFocused(update.view.hasFocus);
      }
    });

    const isText = language === 'text';

    const state = EditorState.create({
      doc: code,
      extensions: [
        !isText ? lineNumbers() : null,
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        getLanguageExtension(language),
        oneDark,
        updateListener,
        EditorView.editable.of(!readOnly),
        EditorView.theme({
          "&": {
            minHeight: isText ? "auto" : "60px",
            maxHeight: "400px",
            fontSize: "12px",
            backgroundColor: isText ? "transparent" : "inherit",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          },
          ".cm-content": {
            padding: isText ? "0" : "4px 0",
          },
          ".cm-gutters": {
            display: isText ? "none" : "flex",
            fontSize: "10px",
            minWidth: "32px",
          },
          ".cm-lineNumbers .cm-gutterElement": {
            padding: "0 4px 0 8px",
          },
        }),
      ].filter((ext): ext is any => ext !== null),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language, isCollapsed, readOnly]);

  useEffect(() => {
    if (viewRef.current) {
      const currentCode = viewRef.current.state.doc.toString();
      if (currentCode !== code) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentCode.length,
            insert: code,
          },
        });
      }
    }
  }, [code]);

  const isText = language === 'text';

  return (
    <div
      className={`my-2 overflow-hidden transition-all ${isFocused ? "ring-1 ring-blue-500/50" : ""
        }`}
    >
      {!isText && (
        <div className="flex items-center justify-between px-2 py-1 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={readOnly}
              className="text-[11px] bg-gray-800 text-gray-300 border-none rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500">{lineCount}라인</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[11px] ${copied
                ? "text-green-400 bg-green-400/10"
                : "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                }`}
              title="복사"
            >
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
                  <span>복사됨!</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  <span>복사</span>
                </>
              )}
            </button>

            <div className="w-[1px] h-3 bg-gray-800 mx-0.5" />

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-all"
              title={isCollapsed ? "펼치기" : "접기"}
            >
              {isCollapsed ? (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              )}
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                title="삭제"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {!isCollapsed && <div ref={editorRef} />}

      {isCollapsed && (
        <div className="px-2 py-1 bg-gray-900 text-gray-500 text-[11px] font-mono truncate">
          {code.split("\n")[0] || "(빈 코드)"}
        </div>
      )}
    </div>
  );
}

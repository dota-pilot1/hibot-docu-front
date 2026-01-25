import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  $isListNode,
  ListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $isHeadingNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import type { HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createCodeMirrorNode } from "@/shared/ui/lexical/CodeMirrorNode";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  QueueListIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CodeBracketIcon,
  CodeBracketSquareIcon,
  XMarkIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { INSERT_IMAGE_COMMAND } from "@/shared/ui/lexical/ImagePlugin";
import { uploadImage } from "@/shared/ui/lexical/imageUpload";
import { BaseDialog } from "@/shared/ui/dialogs/BaseDialog";
import { Button } from "@/shared/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { CUSTOM_TRANSFORMERS } from "./markdownTransformers";
import { MarkdownCodeBlock } from "../MarkdownCodeBlock";
import { api } from "@/shared/api";

const H1Icon = () => <span className="font-bold text-xs">H1</span>;
const H2Icon = () => <span className="font-bold text-xs">H2</span>;
const QuoteIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
  </svg>
);

interface LexicalToolbarProps {
  hideAiButton?: boolean;
}

export function LexicalToolbar({ hideAiButton = false }: LexicalToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");

  const [showMdPreview, setShowMdPreview] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [mdContent, setMdContent] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  // AI 대화 다이어로그 상태
  const [showAiDialog, setShowAiDialog] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; showRaw?: boolean }[]
  >([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 이미지 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const insertCodeMirror = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const codeMirrorNode = $createCodeMirrorNode(
          "// 코드를 입력하세요",
          "javascript",
        );
        selection.insertNodes([codeMirrorNode]);
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: imageUrl,
          altText: file.name,
        });
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const openImageFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  const convertToMarkdown = async (text: string) => {
    setIsConverting(true);
    try {
      const response = await api.post("/ai/chat", {
        message: text,
        systemPrompt: `당신은 문서 가독성 전문가입니다. **현재 문서에 기술 용어마다 줄바꿈이 생겨 읽기가 매우 불편합니다.**

1. **백틱(\`) 및 블록(\`\`\`) 금지**: 단어 하나(예: function, void), 짧은 구문을 강조하기 위해 백틱이나 코드 블록을 **절대로** 쓰지 마세요.
2. **기술 용어 처리**: 모든 기술 용어는 강조하지 말고 그냥 **일반 텍스트**로 작성하세요. 강조가 필요할 때만 **굵은 글씨**만 사용하세요.
3. **포맷팅**: 
   - 설명 본문은 마크다운 기호 없이 **평문**으로 작성하세요.
   - 코드 예시가 필요할 때만 언어 이름을 명시한 \`\`\` (예: \`\`\`typescript) 블록을 사용하세요.
   - 줄바꿈을 최소화하여 내용이 연결된 느낌을 주세요.

사용자의 텍스트를 "줄바꿈 없이 물 흐르듯 읽히는 일반 에세이 형식"으로 재구성하세요. 결과만 출력하세요.`,
      });

      setMdContent(response.data.response || response.data.message || text);
    } catch (error) {
      console.error("마크다운 변환 오류:", error);
      setMdContent(text);
    } finally {
      setIsConverting(false);
    }
  };

  const openMdPreview = () => {
    let textContent = "";
    editor.getEditorState().read(() => {
      const root = $getRoot();
      textContent = root.getTextContent();
    });
    setOriginalContent(textContent);
    setMdContent(textContent);
    setShowMdPreview(true);
  };

  const closeMdPreview = () => {
    setShowMdPreview(false);
    setOriginalContent("");
    setMdContent("");
  };

  const applyMdToEditor = () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(mdContent, CUSTOM_TRANSFORMERS);
    });
    closeMdPreview();
  };

  // AI 대화 함수들
  const openAiDialog = () => {
    setShowAiDialog(true);
    setAiMessages([]);
    setAiInput("");
  };

  const closeAiDialog = () => {
    setShowAiDialog(false);
    setAiMessages([]);
    setAiInput("");
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMessage = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setAiInput("");
    setIsAiLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        systemPrompt: `당신은 기술 문서 작성 전문가인 '하이브릿 도큐' 에이전트입니다. **문서가 조각나 보이지 않도록 일관성 있는 포맷을 유지해야 합니다.**

1. **설명과 코드의 분리**:
   - **설명(Text)**: 백틱(\`)을 쓰지 말고 일반 문장으로 쭉 작성하세요. (중요 용어는 **굵게** 표시)
   - **코드(Code)**: 오직 3줄 이상의 실제 코드일 때만 \`\`\` [언어] 형식을 사용하세요.
2. **줄바꿈 절제**: 문장 중간에 줄바꿈을 유발하는 마크다운 기호를 피하세요.
3. **가독성**: 섹션 사이에는 빈 줄을 넣어 구분을 확실히 하되, 문장 자체는 매끄럽게 이어져야 합니다.

한국어로 작성하세요. 블록 남용 없이 **읽기 편한 잡지나 깔끔한 기술 블로그 형식**으로 작성하세요.`,
      });

      const aiResponse =
        response.data.response || response.data.message || "응답을 생성하지 못했습니다.";
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error: any) {
      console.error("AI 대화 오류:", error);
      const errorMsg = error.response?.data?.message || error.message || "알 수 없는 오류";

      let userFriendlyMessage = "오류가 발생했습니다.";
      if (error.response?.status === 401) {
        userFriendlyMessage =
          "🔑 **API 키 인증 실패**\n\nOpenAI API 키가 유효하지 않거나 설정되지 않았습니다.\n\n관리자에게 문의하세요.";
      } else if (error.response?.status === 429) {
        userFriendlyMessage =
          "⏳ **요청 한도 초과**\n\nAPI 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.response?.status === 500) {
        userFriendlyMessage =
          "🔧 **서버 오류**\n\n서버에서 오류가 발생했습니다.\n\n`" +
          errorMsg +
          "`";
      } else if (error.code === 'ERR_NETWORK') {
        userFriendlyMessage =
          "🌐 **네트워크 오류**\n\n서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.";
      } else {
        userFriendlyMessage =
          "❌ **오류 발생**\n\n`" + errorMsg + "`\n\n다시 시도해주세요.";
      }

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: userFriendlyMessage,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiResponseToEditor = (content: string) => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      $convertFromMarkdownString(content, CUSTOM_TRANSFORMERS);
    });
    closeAiDialog();
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-20 overflow-x-auto">
      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          icon={<ArrowUturnLeftIcon className="w-4 h-4" />}
          tooltip="Undo"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          icon={<ArrowUturnRightIcon className="w-4 h-4" />}
          tooltip="Redo"
        />
      </div>

      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          active={isBold}
          icon={<BoldIcon className="w-4 h-4" />}
          tooltip="Bold"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          active={isItalic}
          icon={<ItalicIcon className="w-4 h-4" />}
          tooltip="Italic"
        />
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          active={isUnderline}
          icon={<UnderlineIcon className="w-4 h-4" />}
          tooltip="Underline"
        />
        <ToolbarButton
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
          }
          active={isStrikethrough}
          icon={<StrikethroughIcon className="w-4 h-4" />}
          tooltip="Strikethrough"
        />
        <ToolbarButton
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
          active={isCode}
          icon={<CodeBracketIcon className="w-4 h-4" />}
          tooltip="Inline Code"
        />
      </div>

      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
        <ToolbarButton
          onClick={() => formatHeading("h1")}
          active={blockType === "h1"}
          icon={<H1Icon />}
          tooltip="H1"
        />
        <ToolbarButton
          onClick={() => formatHeading("h2")}
          active={blockType === "h2"}
          icon={<H2Icon />}
          tooltip="H2"
        />
        <ToolbarButton
          onClick={() => formatQuote()}
          active={blockType === "quote"}
          icon={<QuoteIcon />}
          tooltip="Quote"
        />
      </div>

      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
        <ToolbarButton
          onClick={formatBulletList}
          active={blockType === "bullet"}
          icon={<ListBulletIcon className="w-4 h-4" />}
          tooltip="Bullet List"
        />
        <ToolbarButton
          onClick={formatNumberedList}
          active={blockType === "number"}
          icon={<QueueListIcon className="w-4 h-4" />}
          tooltip="Numbered List"
        />
      </div>

      <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200 mr-2">
        <ToolbarButton
          onClick={insertCodeMirror}
          active={blockType === "codemirror"}
          icon={<CodeBracketSquareIcon className="w-4 h-4" />}
          tooltip="Code Block"
        />
        <ToolbarButton
          onClick={openImageFilePicker}
          icon={
            isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
            ) : (
              <PhotoIcon className="w-4 h-4" />
            )
          }
          tooltip="이미지 업로드"
        />
      </div>

      {!hideAiButton && (
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={openAiDialog}
            icon={<SparklesIcon className="w-4 h-4" />}
            tooltip="AI 자동 생성"
          />
          <ToolbarButton
            onClick={openMdPreview}
            icon={<span className="text-[10px] font-bold">MD</span>}
            tooltip="Markdown Preview"
          />
        </div>
      )}

      <BaseDialog
        open={showMdPreview}
        onOpenChange={setShowMdPreview}
        title="Markdown Preview"
        maxWidth="sm:max-w-6xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={closeMdPreview}
            >
              취소
            </Button>
            <Button
              onClick={applyMdToEditor}
            >
              적용
            </Button>
          </div>
        }
      >
        <div className="flex min-h-[50vh] overflow-hidden border rounded-lg border-gray-200">
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                원본 (편집 가능)
              </span>
            </div>
            <textarea
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              className="flex-1 p-4 text-sm text-gray-800 resize-none focus:outline-none font-mono"
              placeholder="텍스트를 입력하세요..."
            />
          </div>

          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                마크다운 변환 결과
              </span>
              <Button
                onClick={() => convertToMarkdown(originalContent)}
                isLoading={isConverting}
                size="sm"
              >
                AI 변환
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    code: MarkdownCodeBlock as any
                  }}
                >
                  {mdContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </BaseDialog>

      {/* AI 대화 다이어로그 */}
      <BaseDialog
        open={showAiDialog}
        onOpenChange={setShowAiDialog}
        title="AI 문서 생성"
        maxWidth="sm:max-w-4xl"
        footer={
          <div className="flex gap-2 w-full">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAiMessage();
                }
              }}
              placeholder="어떤 문서를 작성해드릴까요?"
              rows={3}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
              disabled={isAiLoading}
            />
            <Button
              onClick={sendAiMessage}
              disabled={isAiLoading || !aiInput.trim()}
              className="self-end h-10 w-10 shrink-0"
              size="icon"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </div>
        }
      >
        <div className="space-y-4 min-h-[40vh]">
          {aiMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <SparklesIcon className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">어떤 문서를 작성해드릴까요?</p>
              <p className="text-xs mt-1">
                예: "Spring Boot REST API 튜토리얼 작성해줘"
              </p>
            </div>
          )}
          {aiMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[100%] ${msg.role === "user"
                  ? "p-3 bg-blue-600 text-white rounded-lg shadow-sm"
                  : "p-0 text-gray-800"
                  }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none px-2 py-1 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none prose-code:bg-transparent prose-code:border-none prose-code:p-0">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() => {
                          const newMessages = [...aiMessages];
                          newMessages[idx].showRaw = !newMessages[idx].showRaw;
                          setAiMessages(newMessages);
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-bold"
                      >
                        {msg.showRaw ? "Rendered View" : "View Raw Source"}
                      </button>
                    </div>

                    {msg.showRaw ? (
                      <pre className="p-2 bg-gray-900 text-gray-300 rounded text-[11px] overflow-x-auto whitespace-pre-wrap font-mono">
                        {msg.content}
                      </pre>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          code: MarkdownCodeBlock as any
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}

                    <button
                      onClick={() => applyAiResponseToEditor(msg.content)}
                      className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md active:scale-95 text-center w-full"
                    >
                      에디터에 적용 (최종 문서 생성)
                    </button>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">생성 중...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </BaseDialog>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  icon,
  tooltip,
}: {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${active
        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
        : "text-gray-500 hover:bg-gray-100"
        }`}
      title={tooltip}
    >
      {icon}
    </button>
  );
}

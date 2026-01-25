import {
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactElement,
} from "react";
import { DecoratorNode, $getNodeByKey } from "lexical";
import type {
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { TrashIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

export type ImageAlignment = "left" | "center" | "right";

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width?: number;
    alignment?: ImageAlignment;
  },
  SerializedLexicalNode
>;

const MIN_WIDTH = 120;
const MAX_WIDTH = 800;

function ImageComponent({
  src,
  altText,
  width,
  alignment,
  nodeKey,
}: {
  src: string;
  altText: string;
  width?: number;
  alignment: ImageAlignment;
  nodeKey: NodeKey;
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected] = useLexicalNodeSelection(nodeKey);
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    if (width) {
      setCurrentWidth(width);
    }
  }, [width]);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      if (!currentWidth) {
        setCurrentWidth(Math.min(imageRef.current.naturalWidth, 600));
      }
    }
  }, [currentWidth]);

  const handleRemove = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node) {
        node.remove();
      }
    });
  }, [editor, nodeKey]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected(!isSelected);
    },
    [isSelected, setSelected],
  );

  const updateNodeSize = useCallback(
    (newWidth: number) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidth(newWidth);
        }
      });
    },
    [editor, nodeKey],
  );

  const updateNodeAlignment = useCallback(
    (newAlignment: ImageAlignment) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setAlignment(newAlignment);
        }
      });
    },
    [editor, nodeKey],
  );

  const handleResizePreset = useCallback(
    (percent: number) => {
      if (naturalSize.width > 0) {
        const calculated = Math.round((naturalSize.width * percent) / 100);
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, calculated));
        setCurrentWidth(newWidth);
        updateNodeSize(newWidth);
      }
    },
    [naturalSize.width, updateNodeSize],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: currentWidth || naturalSize.width,
      };
    },
    [currentWidth, naturalSize.width],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startPosRef.current.width + deltaX),
      );
      setCurrentWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (currentWidth) {
        updateNodeSize(currentWidth);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, currentWidth, updateNodeSize]);

  const alignmentClass = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[alignment];

  return (
    <div
      className={`relative my-2 ${alignmentClass}`}
      style={{
        width: currentWidth ? `${currentWidth}px` : "auto",
        maxWidth: "100%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        onLoad={handleImageLoad}
        className={`w-full h-auto rounded ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        style={{ maxWidth: "100%" }}
        draggable={false}
      />

      {/* 이미지 툴바 */}
      {isSelected && (
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-center gap-1 z-10">
          <div className="flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 border border-gray-200">
            {/* 크기 프리셋 */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResizePreset(percent);
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title={`${percent}% 크기`}
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* 정렬 버튼 */}
            <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateNodeAlignment("left");
                }}
                className={`p-1.5 rounded transition-colors ${alignment === "left" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="왼쪽 정렬"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateNodeAlignment("center");
                }}
                className={`p-1.5 rounded transition-colors ${alignment === "center" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="가운데 정렬"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateNodeAlignment("right");
                }}
                className={`p-1.5 rounded transition-colors ${alignment === "right" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
                title="오른쪽 정렬"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z" />
                </svg>
              </button>
            </div>

            {/* 삭제 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="이미지 삭제"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 리사이즈 핸들 */}
      {isSelected && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl cursor-se-resize flex items-center justify-center hover:bg-blue-600 transition-colors"
          title="드래그하여 크기 조절"
        >
          <ArrowsPointingOutIcon className="w-3 h-3 text-white" />
        </div>
      )}

      {/* 호버 시 삭제 버튼 (선택 안 된 상태) */}
      {isHovered && !isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md"
          title="이미지 삭제"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __altText: string;
  __width?: number;
  __alignment: ImageAlignment;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__alignment,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string = "",
    width?: number,
    alignment: ImageAlignment = "left",
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__alignment = alignment;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "image-node-wrapper";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  setWidth(width: number): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  getAlignment(): ImageAlignment {
    return this.__alignment;
  }

  setAlignment(alignment: ImageAlignment): void {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }

  decorate(): ReactElement {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        alignment={this.__alignment}
        nodeKey={this.__key}
      />
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, alignment } = serializedNode;
    return $createImageNode(src, altText, width, alignment);
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      alignment: this.__alignment,
      type: "image",
      version: 1,
    };
  }

  getTextContent(): string {
    const widthPart = this.__width ? `|width=${this.__width}` : "";
    const alignPart =
      this.__alignment !== "left" ? `|align=${this.__alignment}` : "";
    return `![${this.__altText}${widthPart}${alignPart}](${this.__src})`;
  }

  isEmpty(): boolean {
    return !this.__src;
  }

  isInline(): false {
    return false;
  }
}

export function $createImageNode(
  src: string,
  altText: string = "",
  width?: number,
  alignment: ImageAlignment = "left",
): ImageNode {
  return new ImageNode(src, altText, width, alignment);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

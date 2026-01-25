import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  PASTE_COMMAND,
  createCommand,
} from "lexical";
import type { LexicalCommand } from "lexical";
import { $createImageNode, ImageNode } from "@/shared/ui/lexical/ImageNode";
import { uploadImage } from "@/shared/ui/lexical/imageUpload";

export interface InsertImagePayload {
  src: string;
  altText?: string;
  width?: number;
}

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function ImagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagePlugin: ImageNode not registered on editor");
    }

    const removeInsertImageListener =
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const { src, altText, width } = payload;

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const imageNode = $createImageNode(src, altText || "", width);
            selection.insertNodes([imageNode]);
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      );

    const removePasteListener = editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();

              uploadImage(file)
                .then((url) => {
                  if (url) {
                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                      src: url,
                      altText: file.name || "붙여넣은 이미지",
                    });
                  }
                })
                .catch((err) => {
                  console.error("이미지 업로드 실패:", err);
                  alert("이미지 업로드에 실패했습니다.");
                });

              return true;
            }
          }
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      removeInsertImageListener();
      removePasteListener();
    };
  }, [editor]);

  return null;
}

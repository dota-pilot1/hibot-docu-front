import {
    ElementTransformer,
    TRANSFORMERS,
} from "@lexical/markdown";
import {
    $createCodeMirrorNode,
    $isCodeMirrorNode,
    CodeMirrorNode,
} from "./CodeMirrorNode";
import {
    $createImageNode,
    $isImageNode,
    ImageNode,
} from "./ImageNode";
import type { ImageAlignment } from "./ImageNode";
import { $createTextNode, LexicalNode } from "lexical";

export const CODE_MIRROR_TRANSFORMER: ElementTransformer = {
    dependencies: [CodeMirrorNode],
    export: (node: LexicalNode) => {
        if (!$isCodeMirrorNode(node)) return null;
        return `\`\`\`${node.getLanguage()}\n${node.getCode()}\n\`\`\``;
    },
    regExp: /^```(\w*)$/,
    replace: (parentNode, children, match) => {
        const language = match[1] || "text";
        const codeMirrorNode = $createCodeMirrorNode("", language);
        parentNode.replace(codeMirrorNode);
    },
    type: "element",
};

export const IMAGE_TRANSFORMER: ElementTransformer = {
    dependencies: [ImageNode],
    export: (node: LexicalNode) => {
        if (!$isImageNode(node)) return null;
        const widthPart = node.getWidth() ? `|width=${node.getWidth()}` : "";
        const alignPart =
            node.getAlignment() !== "left" ? `|align=${node.getAlignment()}` : "";
        return `![${node.getAltText()}${widthPart}${alignPart}](${node.getSrc()})`;
    },
    regExp: /^!\[([^\]]*)\]\(([^)]+)\)$/,
    replace: (parentNode, children, match) => {
        const altPart = match[1];
        const src = match[2];

        let altText = altPart;
        let width: number | undefined;
        let alignment: ImageAlignment = "left";

        if (altPart.includes("|")) {
            const parts = altPart.split("|");
            altText = parts[0];
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith("width=")) {
                    width = parseInt(part.replace("width=", ""), 10);
                } else if (part.startsWith("align=")) {
                    alignment = part.replace("align=", "") as ImageAlignment;
                }
            }
        }

        const imageNode = $createImageNode(src, altText, width, alignment);
        parentNode.replace(imageNode);
    },
    type: "element",
};

export const CUSTOM_TRANSFORMERS = [
    CODE_MIRROR_TRANSFORMER,
    IMAGE_TRANSFORMER,
    ...TRANSFORMERS,
];

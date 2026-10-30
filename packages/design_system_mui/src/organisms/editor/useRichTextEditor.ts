import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * Headless rich-text editor (Tiptap, same extensions as SuggestionsEditor) for UIs built elsewhere:
 * the Tailwind editor in @repo/design_system renders the toolbar and the frame. StarterKit (v3)
 * brings bold, italic, underline, strike, lists and links. The content area gets the
 * `rich-text-content` class, styled in the design system's theme.css. `placeholder` may be a
 * function, read on every redraw (e.g. to follow a chosen category).
 */
export function useRichTextEditor(placeholder: string | (() => string)) {
  return useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: typeof placeholder === "function" ? () => placeholder() : placeholder }),
    ],
    content: "",
    editorProps: { attributes: { class: "rich-text-content" } },
    immediatelyRender: false,
    // The toolbar shows which marks are on; re-render on every change.
    shouldRerenderOnTransaction: true,
  });
}

export { EditorContent as RichTextContent };
export type { Editor as RichTextEditor };

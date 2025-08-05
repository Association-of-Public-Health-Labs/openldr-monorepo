import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Divider, Button } from "@mui/material";
import {
  BiBold,
  BiItalic,
  BiUnderline,
  BiStrikethrough,
  BiListUl,
  BiListOl,
  BiAlignLeft,
  BiAlignMiddle,
  BiAlignRight,
  BiAlignJustify,
  BiLink,
  BiLinkAlt,
  BiSend,
} from "react-icons/bi";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { SyncLoader } from "react-spinners";

export function SuggestionsEditor({ placeholder, onSubmit, loading }: { placeholder: string; onSubmit: (content: string) => void, loading?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 1,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        {/* Text Formatting */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive("bold") ? "primary" : "default"}
          >
            <BiBold size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive("italic") ? "primary" : "default"}
          >
            <BiItalic size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            color={editor.isActive("underline") ? "primary" : "default"}
          >
            <BiUnderline size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            color={editor.isActive("strike") ? "primary" : "default"}
          >
            <BiStrikethrough size={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive("bulletList") ? "primary" : "default"}
          >
            <BiListUl size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive("orderedList") ? "primary" : "default"}
          >
            <BiListOl size={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <Tooltip title="Align Left">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
          >
            <BiAlignLeft size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Center">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            color={editor.isActive({ textAlign: "center" }) ? "primary" : "default"}
          >
            <BiAlignMiddle size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Align Right">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            color={editor.isActive({ textAlign: "right" }) ? "primary" : "default"}
          >
            <BiAlignRight size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Justify">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            color={editor.isActive({ textAlign: "justify" }) ? "primary" : "default"}
          >
            <BiAlignJustify size={16} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {/* Links */}
        <Tooltip title="Insert Link">
          <IconButton
            size="small"
            onClick={() => {
              const url = window.prompt("Enter URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            color={editor.isActive("link") ? "primary" : "default"}
          >
            <BiLink size={16} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Remove Link">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
          >
            <BiLinkAlt size={16} />
          </IconButton>
        </Tooltip>

      </Box>
    );
  };

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: "background.paper",
        maxWidth: isFullscreen ? "100vw" : "800px",
        width: "100%",
        height: isFullscreen ? "100vh" : "auto",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
      }}
    >
      <MenuBar />
      
      <Box
        sx={{
          p: 2,
          minHeight: "200px",
          "& .ProseMirror": {
            outline: "none",
            minHeight: "150px",
            "& p": {
              margin: 0,
            },
            // Remove the CSS placeholder
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Bottom Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          p: 1,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Button
          variant="contained"
          color="success"
          size="small"
          endIcon={<BiSend size={16} />}
          sx={{ borderRadius: 2, color: "white" }}
          onClick={() => onSubmit(editor.getHTML())}
          disabled={isEmpty}
        >
          {loading ? <SyncLoader size={8} color="white" /> : "Enviar"}
        </Button>
      </Box>
    </Box>
  );
}
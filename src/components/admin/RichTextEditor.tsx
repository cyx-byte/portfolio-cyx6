"use client";

import { useRef, useEffect } from "react";
import { SANS_FONT } from "@/lib/fonts";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export function RichTextEditor({ value, onChange, className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync external value changes into the editor
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    onChange(el.innerHTML);
  }

  function execBold() {
    document.execCommand("bold", false);
    editorRef.current?.focus();
    handleInput();
  }

  function applyFontSize(size: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    if (!editorRef.current.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const span = document.createElement("span");
    span.style.fontSize = size;
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    selection.removeAllRanges();
    handleInput();
  }

  return (
    <div className={className}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-stone-100">
        <button
          type="button"
          className="text-xs px-2 py-0.5 rounded border border-stone-300 text-stone-600 hover:bg-stone-100 font-bold"
          onClick={execBold}
          title="加粗选中文字"
        >
          B
        </button>
        <select
          className="text-xs border border-stone-200 rounded px-1 py-0.5 text-stone-600"
          onChange={(e) => {
            if (e.target.value) applyFontSize(e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
        >
          <option value="" disabled>字号</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
        </select>
        <span className="text-[10px] text-stone-300 ml-auto">
          选中文字后点击格式
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[80px] border border-stone-200 rounded-md px-3 py-2 text-sm text-stone-700
                   focus:outline-none focus:border-stone-400 bg-white
                   whitespace-pre-wrap break-words"
        style={{ fontFamily: SANS_FONT }}
      />
    </div>
  );
}

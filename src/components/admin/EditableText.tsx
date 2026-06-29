"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "./AdminProvider";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  fontSize?: string;
  fontWeight?: "normal" | "bold";
  onFontSizeChange?: (size: string) => void;
  onFontWeightChange?: (weight: "normal" | "bold") => void;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  placeholder?: string;
  multiline?: boolean;
}

export function EditableText({
  value,
  onChange,
  fontSize = "16px",
  fontWeight = "normal",
  onFontSizeChange,
  onFontWeightChange,
  className = "",
  as: Tag = "span",
  placeholder = "点击编辑",
  multiline = false,
}: EditableTextProps) {
  const { isAdmin } = useAdmin();
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localFontWeight, setLocalFontWeight] = useState(fontWeight);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    setLocalFontWeight(fontWeight);
  }, [fontWeight]);

  // Close on click outside
  useEffect(() => {
    if (!editing) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        commit();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editing, localValue, localFontSize, localFontWeight]);

  function commit() {
    onChange(localValue);
    if (onFontSizeChange) onFontSizeChange(localFontSize);
    if (onFontWeightChange) onFontWeightChange(localFontWeight);
    setEditing(false);
  }

  const displayContent = value || placeholder;

  return (
    <span className="relative inline" ref={ref}>
      {/* Display */}
      <Tag
        className={`${className} ${
          isAdmin
            ? "cursor-pointer outline-1 outline-dashed outline-transparent hover:outline-stone-300 transition-[outline] rounded-sm"
            : ""
        }`}
        style={{ fontSize: localFontSize, fontWeight: localFontWeight === "bold" ? 700 : 400 }}
        onClick={() => isAdmin && setEditing(true)}
        title={isAdmin ? "点击编辑" : undefined}
      >
        {displayContent}
        {isAdmin && value === "" && (
          <span className="text-stone-300 italic">{placeholder}</span>
        )}
      </Tag>

      {/* Edit popup */}
      <AnimatePresence>
        {editing && (
          <motion.div
            className="absolute z-[90] top-full left-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-lg p-4 min-w-[280px]"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Text input */}
            {multiline ? (
              <textarea
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 resize-none"
                rows={4}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
              />
            )}

            {/* Font controls */}
            <div className="flex items-center gap-3 mt-3">
              {/* Font size */}
              {onFontSizeChange && (
                <select
                  className="text-xs border border-stone-200 rounded px-2 py-1 text-stone-600"
                  value={localFontSize}
                  onChange={(e) => setLocalFontSize(e.target.value)}
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="18px">18px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="28px">28px</option>
                  <option value="32px">32px</option>
                </select>
              )}

              {/* Font weight */}
              {onFontWeightChange && (
                <button
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    localFontWeight === "bold"
                      ? "bg-stone-800 text-white border-stone-800"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                  onClick={() =>
                    setLocalFontWeight(
                      localFontWeight === "bold" ? "normal" : "bold"
                    )
                  }
                >
                  B
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="text-xs px-3 py-1.5 text-stone-400 hover:text-stone-600"
                onClick={() => setEditing(false)}
              >
                取消
              </button>
              <button
                className="text-xs px-3 py-1.5 bg-stone-800 text-white rounded-md hover:bg-stone-700"
                onClick={commit}
              >
                确认
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

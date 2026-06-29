"use client";

import { useRef, useEffect, useState } from "react";
import type { TableData } from "@/types";
import { SANS_FONT } from "@/lib/fonts";

// ---- Helpers ----

function hexToRgba(hex: string, opacity: number): string {
  if (!hex) return "transparent";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

const BG_COLORS = [
  { label: "无", value: "" },
  { label: "暖白", value: "#fefcf8" },
  { label: "浅灰", value: "#f5f4f0" },
  { label: "米色", value: "#faf6f0" },
  { label: "淡蓝", value: "#f4f6f9" },
  { label: "浅绿", value: "#f4f7f4" },
];

const FONT = SANS_FONT;

// ---- Inline cell editor ----

/** Strip inline font-size styles — fontSize is managed by cell property, not HTML */
function cleanHtml(html: string): string {
  return html
    .replace(/\s*style\s*=\s*"[^"]*font-size\s*:[^"]*"/gi, "")
    .replace(/\s*style\s*=\s*'[^']*font-size\s*:[^']*'/gi, "")
    // Remove empty style attrs
    .replace(/\s*style\s*=\s*""/gi, "")
    .replace(/\s*style\s*=\s*''/gi, "")
    // Also strip <font> tags that contentEditable sometimes inserts
    .replace(/<\/?font[^>]*>/gi, "");
}

function CellInput({ value, onChange, fontSize, fontWeight }: {
  value: string;
  onChange: (html: string) => void;
  fontSize: string;
  fontWeight: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Always show clean content
    const cleaned = cleanHtml(value);
    if (el.innerHTML !== cleaned) {
      el.innerHTML = cleaned;
    }
  }, [value]);

  function handleInput() {
    if (!ref.current) return;
    const html = cleanHtml(ref.current.innerHTML);
    onChange(html);
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      className="min-h-[1.5em] outline-none whitespace-pre-wrap break-words"
      style={{
        fontFamily: FONT,
        fontSize: fontSize,
        fontWeight: fontWeight === "bold" ? "700" : "400",
      }}
    />
  );
}

// ---- Table Editor ----

interface TableEditorProps {
  table: TableData;
  onChange: (table: TableData) => void;
}

type CellAddr = { rowIdx: number; cellIdx: number };

const defaultCell = () => ({
  id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  content: "",
  bgColor: "",
  bgOpacity: 100,
  width: "100%",
  fontSize: "14px",
  fontWeight: "normal" as const, // kept for backward compat; bold is now inline <b> tags
});

export function TableEditor({ table, onChange }: TableEditorProps) {
  const [selected, setSelected] = useState<CellAddr[]>([]);

  // --- Row ops ---
  function addRow() {
    onChange({ rows: [...table.rows, { id: `row-${Date.now()}`, cells: [defaultCell()] }] });
  }

  function deleteRow(rowIdx: number) {
    if (table.rows.length <= 1) return;
    const newRows = table.rows.filter((_, i) => i !== rowIdx);
    onChange({ rows: newRows });
    setSelected((prev) => prev.filter((s) => s.rowIdx !== rowIdx).map((s) =>
      s.rowIdx > rowIdx ? { ...s, rowIdx: s.rowIdx - 1 } : s
    ));
  }

  // --- Cell ops ---
  function addCell(rowIdx: number) {
    const row = table.rows[rowIdx];
    const n = row.cells.length + 1;
    const each = `${Math.floor(100 / n)}%`;
    onChange({
      rows: table.rows.map((r, ri) =>
        ri === rowIdx
          ? { ...r, cells: [...r.cells.map((c) => ({ ...c, width: each })), { ...defaultCell(), width: each }] }
          : r
      ),
    });
  }

  function deleteCell(rowIdx: number, cellIdx: number) {
    const row = table.rows[rowIdx];
    if (row.cells.length <= 1) return;
    const remaining = row.cells.filter((_, i) => i !== cellIdx);
    const each = `${Math.floor(100 / remaining.length)}%`;
    onChange({
      rows: table.rows.map((r, ri) =>
        ri === rowIdx ? { ...r, cells: remaining.map((c) => ({ ...c, width: each })) } : r
      ),
    });
    setSelected((prev) => prev.filter((s) => !(s.rowIdx === rowIdx && s.cellIdx === cellIdx)));
  }

  function updateCell(rowIdx: number, cellIdx: number, patch: Partial<typeof defaultCell>) {
    onChange({
      rows: table.rows.map((row, ri) =>
        ri === rowIdx
          ? { ...row, cells: row.cells.map((c, ci) => (ci === cellIdx ? { ...c, ...patch } : c)) }
          : row
      ),
    });
  }

  // --- Selection ---
  function toggleSelect(rowIdx: number, cellIdx: number) {
    setSelected((prev) => {
      const idx = prev.findIndex((s) => s.rowIdx === rowIdx && s.cellIdx === cellIdx);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { rowIdx, cellIdx }];
    });
  }

  function selectAll() {
    const all: CellAddr[] = [];
    table.rows.forEach((row, ri) => row.cells.forEach((_, ci) => all.push({ rowIdx: ri, cellIdx: ci })));
    setSelected(all);
  }

  // --- Bulk formatting ---
  function applyToSelected(patch: Partial<typeof defaultCell>) {
    onChange({
      rows: table.rows.map((row, ri) => ({
        ...row,
        cells: row.cells.map((c, ci) =>
          selected.some((s) => s.rowIdx === ri && s.cellIdx === ci) ? { ...c, ...patch } : c
        ),
      })),
    });
  }

  const selCount = selected.length;
  const firstSel = selected[0];
  const selCell = firstSel ? table.rows[firstSel.rowIdx]?.cells[firstSel.cellIdx] : null;

  return (
    <div className="space-y-2" style={{ fontFamily: FONT }}>
      {/* ====== Unified Toolbar ====== */}
      <div className="flex items-center gap-2 p-2 bg-stone-50 border border-stone-200 rounded-md flex-wrap">
        <span className="text-[10px] text-stone-400 min-w-[60px]">
          {selCount > 0 ? `已选 ${selCount} 格` : "点击单元格选中"}
        </span>

        {/* Bold — per-word inline: onMouseDown+preventDefault keeps focus on cell */}
        <button
          type="button"
          className="text-[10px] px-1.5 py-0.5 rounded border border-stone-300 font-bold hover:bg-stone-100"
          onMouseDown={(e) => {
            e.preventDefault(); // keep focus on contenteditable
            const el = document.activeElement;
            if (!el || !(el as HTMLElement).isContentEditable) return;
            document.execCommand("bold", false);
            // Trigger React's onInput so CellInput saves the change
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }}
        >
          B
        </button>

        {/* Font size */}
        <select
          className="text-[10px] border border-stone-200 rounded px-1 py-0.5 disabled:opacity-30"
          value={selCell?.fontSize || ""}
          disabled={selCount === 0}
          onChange={(e) => applyToSelected({ fontSize: e.target.value })}
        >
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
        </select>

        <span className="w-px h-4 bg-stone-200" />

        {/* Colors */}
        {BG_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`w-4 h-4 rounded-full border ${
              selCell?.bgColor === c.value ? "border-stone-800 ring-1 ring-stone-400" : "border-stone-200"
            }`}
            style={{ backgroundColor: c.value || "#fff" }}
            title={c.label}
            disabled={selCount === 0}
            onClick={() => applyToSelected({ bgColor: c.value })}
          />
        ))}

        {/* Opacity */}
        <input
          type="range" min="10" max="100"
          value={selCell?.bgOpacity ?? 100}
          disabled={selCount === 0}
          onChange={(e) => applyToSelected({ bgOpacity: Number(e.target.value) })}
          className="w-14 h-3"
        />
        <span className="text-[10px] text-stone-300 w-8">{selCell?.bgOpacity ?? 100}%</span>

        <span className="w-px h-4 bg-stone-200" />

        <button className="text-[10px] text-stone-400 hover:text-stone-600" onClick={selectAll}>全选</button>
        <button className="text-[10px] text-stone-400 hover:text-stone-600" onClick={() => setSelected([])}>清除</button>
      </div>

      {/* ====== Table Rows ====== */}
      <div className="space-y-0 border border-stone-200 rounded-md overflow-hidden">
        {table.rows.map((row, ri) => (
          <div key={row.id} className="flex border-b border-stone-100 last:border-b-0 bg-white items-start">
            {/* Delete row button — always visible, prominent */}
            {table.rows.length > 1 && (
              <button
                className="shrink-0 w-6 h-6 flex items-center justify-center text-sm text-red-400 hover:text-red-600 hover:bg-red-50 rounded m-1"
                onClick={() => deleteRow(ri)}
                title="删除此行"
              >
                ×
              </button>
            )}
            {row.cells.map((cell, ci) => {
              const isSel = selected.some((s) => s.rowIdx === ri && s.cellIdx === ci);
              return (
                <div
                  key={cell.id}
                  onClick={() => toggleSelect(ri, ci)}
                  className={`p-2 cursor-pointer transition-all ${
                    isSel
                      ? "bg-blue-50/60 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.6)]"
                      : "border-r border-stone-100 hover:bg-stone-50/50"
                  }`}
                  style={{
                    flexBasis: cell.width || "auto",
                    flexGrow: 0,
                    flexShrink: 0,
                    backgroundColor: isSel ? undefined : (cell.bgColor ? hexToRgba(cell.bgColor, cell.bgOpacity ?? 100) : "transparent"),
                    fontSize: cell.fontSize || "14px",
                    fontWeight: cell.fontWeight === "bold" ? 700 : 400,
                  }}
                >
                  {/* Width + delete cell */}
                  <div className="flex items-center gap-1 mb-1">
                    <input
                      className="w-12 border border-stone-200 rounded px-1 py-0 text-[9px] text-center bg-white/80"
                      value={cell.width}
                      onChange={(e) => updateCell(ri, ci, { width: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {row.cells.length > 1 && (
                      <button
                        className="text-[9px] text-red-300 hover:text-red-500"
                        onClick={(e) => { e.stopPropagation(); deleteCell(ri, ci); }}
                      >×</button>
                    )}
                  </div>

                  {/* Editable content */}
                  <CellInput
                    value={cell.content}
                    onChange={(html) => updateCell(ri, ci, { content: html })}
                    fontSize={cell.fontSize || "14px"}
                    fontWeight={cell.fontWeight || "normal"}
                  />

                  {/* Add column */}
                  {ci === row.cells.length - 1 && (
                    <button
                      className="mt-2 text-[10px] text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded px-2 py-0.5 w-full"
                      onClick={(e) => { e.stopPropagation(); addCell(ri); }}
                    >
                      + 分列
                    </button>
                  )}
                </div>
              );
            })}

          </div>
        ))}
      </div>

      <button
        className="text-xs text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded px-3 py-1.5 w-full"
        onClick={addRow}
      >
        + 添加行
      </button>
    </div>
  );
}

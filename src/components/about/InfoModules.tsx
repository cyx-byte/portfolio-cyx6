"use client";

import { motion } from "framer-motion";
import { sanitizeHtml } from "@/lib/sanitize";
import type { InfoModule, InfoModuleText, InfoModuleTable, TableCell } from "@/types";

function cellBg(cell: TableCell): string {
  if (!cell.bgColor) return "transparent";
  const opacity = (cell.bgOpacity ?? 100) / 100;
  const hex = cell.bgColor;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function TextModule({ mod, centered }: { mod: InfoModuleText; centered: boolean }) {
  return (
    <div
      className={`text-stone-700 leading-relaxed whitespace-pre-line font-sans ${centered ? "text-center" : ""}`}
      style={{
        fontSize: mod.fontSize,
        fontWeight: mod.fontWeight === "bold" ? 700 : 400,
      }}
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(mod.content.replace(/\n/g, "<br/>")),
      }}
    />
  );
}

function TableModule({ mod, centered }: { mod: InfoModuleTable; centered: boolean }) {
  const { table } = mod;
  if (!table.rows.length) {
    return <p className="text-stone-300 text-sm font-sans">空表格</p>;
  }

  return (
    <div className="space-y-0 font-sans">
      {table.rows.map((row) => (
        <div key={row.id} className="flex">
          {row.cells.map((cell) => (
            <div
              key={cell.id}
              className={`px-3 py-2 text-stone-700 leading-relaxed whitespace-pre-line table-cell-display ${centered ? "text-center" : ""}`}
              style={{
                flexBasis: cell.width || "auto",
                flexGrow: 0,
                flexShrink: 0,
                backgroundColor: cellBg(cell),
                fontSize: cell.fontSize || "14px",
                fontWeight: cell.fontWeight === "bold" ? 700 : 400,
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(cell.content.replace(/\n/g, "<br/>")),
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface InfoModulesProps {
  modules: InfoModule[];
  centered?: boolean;
}

export function InfoModules({ modules, centered = false }: InfoModulesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-0 w-full"
    >
      {modules.map((mod, i) => (
        <motion.div
          key={mod.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2 + i * 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="border-b border-stone-200 py-6 last:border-b-0"
          style={{ maxWidth: mod.maxWidth || "none" }}
        >
          {/* Label */}
          <p className={`text-stone-400 text-sm tracking-[0.15em] uppercase mb-3 font-sans ${centered ? "text-center" : ""}`}>
            {mod.label}
          </p>

          {/* Render by module type (legacy modules without moduleType default to text) */}
          {(mod as InfoModuleTable).moduleType === "table" ? (
            <TableModule mod={mod as InfoModuleTable} centered={centered} />
          ) : (
            <TextModule mod={mod as InfoModuleText} centered={centered} />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

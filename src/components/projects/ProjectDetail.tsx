"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/types";
import { sanitizeHtml } from "@/lib/sanitize";
import { DrawingGrid } from "./DrawingGrid";
import { DrawingViewer } from "./DrawingViewer";
import { CircularNav } from "./CircularNav";

interface ProjectDetailProps {
  project: Project;
  sectionId: string;
  prevId: string | null;
  nextId: string | null;
  firstId?: string | null;
  lastId?: string | null;
  drawingLabel?: string;
  flipAnimation?: boolean;
}

export function ProjectDetail({
  project,
  sectionId,
  prevId,
  nextId,
  firstId,
  lastId,
  drawingLabel = "图纸",
  flipAnimation = true,
}: ProjectDetailProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-8 pb-24">
        {/* Header: number + title */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-sm text-stone-400 tracking-[0.15em] mb-2">
            {project.number}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl tracking-[0.06em] text-stone-800">
            {project.title}
          </h1>
        </motion.div>

        {/* Two-column: description (left) + info (right) */}
        <motion.div
          className="flex flex-col md:flex-row gap-12 md:gap-20 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* Left: description (rich HTML) */}
          <div className="flex-1">
            <div
              className="text-stone-600 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(project.description.replace(/\n/g, "<br/>")),
              }}
            />
          </div>

          {/* Right: cover + info modules */}
          <div className="w-full md:w-[300px] shrink-0">
            {/* Cover image — hidden for architecture */}
            {sectionId !== "architecture" && project.coverImage && (
              <div className="relative w-full aspect-square bg-stone-100 overflow-hidden mb-8">
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-0">
              {project.info.map((item) => (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between gap-6 border-b border-stone-200 py-5 last:border-b-0"
                >
                  <span className="text-stone-400 text-sm tracking-[0.12em] uppercase shrink-0">
                    {item.label}
                  </span>
                  <span className="text-stone-700 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Drawings — grouped by category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <h2 className="font-serif text-xl tracking-[0.08em] text-stone-400 mb-8">
            {drawingLabel}
          </h2>
          {(() => {
            const grouped = new Map<string, typeof project.drawings>();
            const uncategorized: typeof project.drawings = [];
            const idxMap = new Map<string, number>();
            project.drawings.forEach((d, i) => { idxMap.set(d.id, i); });

            for (const d of project.drawings) {
              if (d.category) {
                if (!grouped.has(d.category)) grouped.set(d.category, []);
                grouped.get(d.category)!.push(d);
              } else {
                uncategorized.push(d);
              }
            }

            const categories = [...grouped.entries()];
            if (uncategorized.length > 0) categories.push(["", uncategorized]);

            if (categories.length === 0) {
              return <p className="text-stone-300 text-sm">{`暂无${drawingLabel}`}</p>;
            }

            return categories.map(([cat, drawings], ci) => (
              <div
                key={cat || "_uncategorized"}
                className={`${ci > 0 ? "mt-12 pt-8 border-t border-stone-100" : ""} mb-8`}
              >
                {cat && (
                  <h3 className="font-serif text-lg tracking-[0.08em] text-stone-600 mb-6">
                    {cat}
                  </h3>
                )}
                <DrawingGrid
                  drawings={drawings}
                  onSelect={(drawing) => {
                    const gIdx = idxMap.get(drawing.id);
                    if (gIdx != null) setSelectedIdx(gIdx);
                  }}
                  emptyLabel=""
                  placeholderLabel={drawingLabel}
                />
              </div>
            ));
          })()}
        </motion.div>
      </div>

      {/* Prev / Next project navigation (circular, with confirmation dialog) */}
      <CircularNav
        sectionId={sectionId}
        prevId={prevId}
        nextId={nextId}
        firstId={firstId ?? null}
        lastId={lastId ?? null}
      />

      {/* Drawing viewer modal — with prev/next within project */}
      <DrawingViewer
        drawings={project.drawings}
        currentIndex={selectedIdx}
        onClose={() => setSelectedIdx(null)}
        onNavigate={(newIdx) => setSelectedIdx(newIdx)}
        sectionId={sectionId}
        prevProjectId={prevId ?? undefined}
        nextProjectId={nextId ?? undefined}
        drawingLabel={drawingLabel}
        flipAnimation={flipAnimation}
      />
    </>
  );
}

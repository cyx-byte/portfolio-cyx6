"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Drawing } from "@/types";
import { BookFlipImage } from "./BookFlipImage";

interface DrawingViewerProps {
  drawings: Drawing[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  sectionId?: string;
  prevProjectId?: string;
  nextProjectId?: string;
  drawingLabel?: string;
  flipAnimation?: boolean;
  onAddSection?: (title: string, position: number) => void;
  sections?: { id: string; title: string; position: number }[];
  adminMode?: boolean;
}

export function DrawingViewer({
  drawings,
  currentIndex,
  onClose,
  onNavigate,
  sectionId,
  prevProjectId,
  nextProjectId,
  drawingLabel = "图纸",
  flipAnimation = true,
  onAddSection,
  sections = [],
  adminMode = false,
}: DrawingViewerProps) {
  const router = useRouter();
  const isOpen = currentIndex !== null;
  const drawing = currentIndex != null ? drawings[currentIndex] : null;
  const hasPrev = currentIndex != null && currentIndex > 0;
  const hasNext = currentIndex != null && currentIndex < drawings.length - 1;

  const [flipDir, setFlipDir] = useState<"forward" | "backward" | null>(null);
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const [textIdx, setTextIdx] = useState(currentIndex);
  const [crossProject, setCrossProject] = useState<"prev" | "next" | null>(null);
  const [adminZoom, setAdminZoom] = useState(40);

  // Sync text index immediately when currentIndex changes from outside
  useEffect(() => {
    if (currentIndex !== null) setTextIdx(currentIndex);
  }, [currentIndex]);

  function go(dir: "forward" | "backward") {
    if (flipDir) return;
    const target = dir === "forward" ? currentIndex! + 1 : currentIndex! - 1;
    if (!flipAnimation) {
      onNavigate(target);
      return;
    }
    setPendingIdx(target);
    setFlipDir(dir);
    setTextIdx(target);
  }

  function handleFlipEnd() {
    if (pendingIdx !== null) {
      onNavigate(pendingIdx);
      setPendingIdx(null);
    }
    setFlipDir(null);
  }

  const goPrev = useCallback(() => {
    if (hasPrev) { go("backward"); return; }
    // Last resort: cross-project backward
    if (currentIndex === 0 && prevProjectId) { setCrossProject("prev"); }
  }, [hasPrev, currentIndex, prevProjectId]);

  const goNext = useCallback(() => {
    if (hasNext) { go("forward"); return; }
    // Last resort: cross-project forward
    if (currentIndex === drawings.length - 1 && nextProjectId) { setCrossProject("next"); }
  }, [hasNext, currentIndex, drawings.length, nextProjectId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Determine image sources for the flip
  const nextImage = hasNext && flipDir === "forward" ? drawings[currentIndex! + 1]?.image : undefined;
  const prevImage = hasPrev && flipDir === "backward" ? drawings[currentIndex! - 1]?.image : undefined;

  // Get text info for display
  const textDrawing = textIdx != null ? drawings[textIdx] : null;

  return (
    <>
    <AnimatePresence>
      {isOpen && drawing && (
        <motion.div
          key="viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-50/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Previous arrow */}
          {(hasPrev || (currentIndex === 0 && !!prevProjectId)) && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center rounded-full bg-white/90 text-stone-500 hover:text-stone-800 hover:bg-white shadow-sm transition-all"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="12,4 6,10 12,16" />
              </svg>
            </button>
          )}

          {/* Content */}
          <div
            className="flex flex-col md:flex-row gap-0 w-full h-full max-w-[1400px] max-h-[90vh] mx-8 md:mx-20 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT — Text panel: fade in/out independent of image flip */}
            <div className="w-full md:w-[320px] bg-white p-10 flex flex-col justify-center gap-4 overflow-y-auto order-first">
              <AnimatePresence mode="wait">
                <motion.div
                  key={textIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-4"
                >
                  {textDrawing?.title && (
                    <h3 className="font-serif text-xl tracking-[0.06em] text-stone-800">
                      {textDrawing.title}
                    </h3>
                  )}
                  {textDrawing?.description && (
                    <p className="text-sm text-stone-500 leading-relaxed whitespace-pre-line">
                      {textDrawing.description}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Counter */}
              <p className="text-xs text-stone-300">
                {textIdx != null ? textIdx + 1 : 0} / {drawings.length}
              </p>
            </div>

            {/* RIGHT — Image panel: book-flip animation */}
            <div className="relative flex-1 min-h-0 bg-stone-100 flex items-center justify-center overflow-auto">
              {drawing.image ? (
                <div
                  className={`relative h-full ${adminMode ? "cursor-crosshair" : ""}`}
                  style={adminMode ? { width: `${adminZoom}%`, margin: "0 auto" } : { width: "100%" }}
                  onClick={(e) => {
                    if (!adminMode || !onAddSection) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const pct = Math.round((y / rect.height) * 100);
                    onAddSection(`章节 ${sections.length + 1}`, Math.min(100, Math.max(0, pct)));
                  }}
                >
                  {flipAnimation ? (
                    <BookFlipImage
                      currentSrc={drawing.image}
                      nextSrc={nextImage}
                      prevSrc={prevImage}
                      direction={flipDir}
                      onFlipEnd={handleFlipEnd}
                    />
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentIndex}
                        src={drawing.image}
                        alt=""
                        className="absolute inset-0 object-contain w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      />
                    </AnimatePresence>
                  )}
                  {/* Section markers overlay (admin mode) */}
                  {adminMode && sections.map((sec) => (
                    <div
                      key={sec.id}
                      className="absolute left-0 right-0 flex items-center gap-1 pointer-events-none z-20"
                      style={{ top: `${sec.position}%` }}
                    >
                      <div className="flex-1 h-px bg-blue-500" />
                      <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">
                        {sec.position}% {sec.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-stone-300">暂无图片</span>
              )}

              {/* Zoom controls (admin mode, top-right of image panel) */}
              {adminMode && (
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-white/90 rounded-md border border-stone-200 px-2 py-1 shadow-sm">
                  <button
                    className="text-xs px-1.5 hover:bg-stone-100 rounded"
                    onClick={() => setAdminZoom((z) => Math.max(10, z - 10))}
                  >
                    −
                  </button>
                  <span className="text-[10px] text-stone-500 w-8 text-center">{adminZoom}%</span>
                  <button
                    className="text-xs px-1.5 hover:bg-stone-100 rounded"
                    onClick={() => setAdminZoom((z) => Math.min(200, z + 10))}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Next arrow */}
          {(hasNext || (currentIndex === drawings.length - 1 && !!nextProjectId)) && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[102] w-12 h-12 flex items-center justify-center rounded-full bg-white/90 text-stone-500 hover:text-stone-800 hover:bg-white shadow-sm transition-all"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="8,4 14,10 8,16" />
              </svg>
            </button>
          )}

          {/* Close button */}
          <button
            className="fixed top-6 right-6 z-[101] w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-stone-400 hover:text-stone-800 transition-colors"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Cross-project confirmation dialog — own AnimatePresence */}
    <AnimatePresence>
      {crossProject && (
        <motion.div
          key="cross-dialog"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCrossProject(null)}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl p-8 mx-4 max-w-sm text-center"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-stone-700 text-sm leading-relaxed mb-6">
              {crossProject === "next"
                ? `已是本项目最后一张${drawingLabel}，跳转到下一个项目？`
                : `已是本项目第一张${drawingLabel}，返回上一个项目？`}
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-5 py-2 text-sm text-stone-500 border border-stone-200 rounded-md hover:border-stone-400"
                onClick={() => setCrossProject(null)}
              >
                取消
              </button>
              <button
                className="px-5 py-2 text-sm bg-stone-800 text-white rounded-md hover:bg-stone-700"
                onClick={() => {
                  const targetId = crossProject === "next" ? nextProjectId : prevProjectId;
                  setCrossProject(null);
                  onClose();
                  if (targetId && sectionId) {
                    router.push(`/${sectionId}/${targetId}`);
                  }
                }}
              >
                跳转
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

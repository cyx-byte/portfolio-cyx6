"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CircularNavProps {
  sectionId: string;
  prevId: string | null;
  nextId: string | null;
  firstId: string | null;
  lastId: string | null;
  prevLabel?: string;
  nextLabel?: string;
}

export function CircularNav({
  sectionId,
  prevId,
  nextId,
  firstId,
  lastId,
  prevLabel = "上一个",
  nextLabel = "下一个",
}: CircularNavProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{ dir: "prev" | "next"; targetId: string; msg: string } | null>(null);

  function goPrev() {
    if (prevId) { router.push(`/${sectionId}/${prevId}`); return; }
    // Circular: first project → go to last
    if (lastId && lastId !== firstId) {
      setDialog({ dir: "prev", targetId: lastId, msg: "已是第一篇，跳转到最后一篇？" });
    }
  }

  function goNext() {
    if (nextId) { router.push(`/${sectionId}/${nextId}`); return; }
    // Circular: last project → go to first
    if (firstId && firstId !== lastId) {
      setDialog({ dir: "next", targetId: firstId, msg: "已是最后一篇，跳转到第一篇？" });
    }
  }

  const showPrev = !!(prevId || (lastId && lastId !== firstId));
  const showNext = !!(nextId || (firstId && firstId !== lastId));

  return (
    <>
      {/* Fixed side buttons */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none z-40">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between">
          {showPrev ? (
            <button
              className="pointer-events-auto group flex items-center gap-2 text-stone-400 hover:text-stone-700 transition-colors"
              onClick={goPrev}
            >
              <span className="text-2xl font-light">&larr;</span>
              <span className="text-xs tracking-[0.1em] hidden md:inline">{prevLabel}</span>
            </button>
          ) : (
            <div />
          )}
          {showNext ? (
            <button
              className="pointer-events-auto group flex items-center gap-2 text-stone-400 hover:text-stone-700 transition-colors"
              onClick={goNext}
            >
              <span className="text-xs tracking-[0.1em] hidden md:inline">{nextLabel}</span>
              <span className="text-2xl font-light">&rarr;</span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <AnimatePresence>
        {dialog && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDialog(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-8 mx-4 max-w-sm text-center"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-stone-700 text-sm leading-relaxed mb-6">
                {dialog.msg}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  className="px-5 py-2 text-sm text-stone-500 border border-stone-200 rounded-md hover:border-stone-400"
                  onClick={() => setDialog(null)}
                >
                  否
                </button>
                <button
                  className="px-5 py-2 text-sm bg-stone-800 text-white rounded-md hover:bg-stone-700"
                  onClick={() => {
                    router.push(`/${sectionId}/${dialog.targetId}`);
                    setDialog(null);
                  }}
                >
                  是
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

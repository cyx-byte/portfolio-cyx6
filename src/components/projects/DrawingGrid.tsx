"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Drawing } from "@/types";

interface DrawingGridProps {
  drawings: Drawing[];
  onSelect: (drawing: Drawing, index: number) => void;
  emptyLabel?: string;
  placeholderLabel?: string;
}

export function DrawingGrid({ drawings, onSelect, emptyLabel = "暂无图纸", placeholderLabel = "图纸" }: DrawingGridProps) {
  if (drawings.length === 0) {
    return (
      <div className="text-center text-stone-300 py-16 text-sm">{emptyLabel}</div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {drawings.map((drawing, index) => (
        <motion.button
          key={drawing.id}
          className="group cursor-pointer text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          onClick={() => onSelect(drawing, index)}
        >
          {/* Drawing thumbnail */}
          <div className="relative w-full aspect-[3/2] bg-stone-100 overflow-hidden">
            {drawing.image ? (
              <Image
                src={drawing.image}
                alt={drawing.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                quality={60}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                {placeholderLabel}
              </div>
            )}
          </div>

          {/* Title */}
          {drawing.title && (
            <p className="mt-2 text-xs text-stone-400 tracking-[0.06em] group-hover:text-stone-600 transition-colors">
              {drawing.title}
            </p>
          )}
        </motion.button>
      ))}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import type { ImageSection } from "@/types";

interface ImageSectionPlacerProps {
  imageUrl: string;
  sections: ImageSection[];
  onAddSection: (title: string, position: number) => void;
}

export function ImageSectionPlacer({ imageUrl, sections, onAddSection }: ImageSectionPlacerProps) {
  const [previewZoom, setPreviewZoom] = useState(25); // small preview
  const imgRef = useRef<HTMLImageElement>(null);

  function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = Math.round((y / rect.height) * 100);
    const title = `章节 ${sections.length + 1}`;
    onAddSection(title, Math.min(100, Math.max(0, pct)));
  }

  return (
    <div className="border border-stone-200 rounded overflow-hidden bg-stone-50">
      {/* Preview header */}
      <div className="flex items-center justify-between px-2 py-1 bg-white border-b border-stone-100">
        <span className="text-[10px] text-stone-400">长图预览 — 点击图片添加章节</span>
        <div className="flex items-center gap-1">
          <button
            className="text-[10px] px-1.5 py-0.5 border border-stone-200 rounded hover:bg-stone-100"
            onClick={() => setPreviewZoom((z) => Math.max(10, z - 5))}
          >
            −
          </button>
          <span className="text-[10px] text-stone-400 w-8 text-center">{previewZoom}%</span>
          <button
            className="text-[10px] px-1.5 py-0.5 border border-stone-200 rounded hover:bg-stone-100"
            onClick={() => setPreviewZoom((z) => Math.min(100, z + 5))}
          >
            +
          </button>
        </div>
      </div>

      {/* Scrollable preview with section markers */}
      <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
        <div className="relative" style={{ width: `${previewZoom}%` }}>
          <img
            ref={imgRef}
            src={imageUrl}
            alt="长图预览"
            className="w-full h-auto block cursor-crosshair"
            onClick={handleImageClick}
          />

          {/* Section markers overlay */}
          {sections.map((sec) => (
            <div
              key={sec.id}
              className="absolute left-0 right-0 flex items-center gap-1 pointer-events-none"
              style={{ top: `${sec.position}%` }}
            >
              <div className="flex-1 h-px bg-blue-500" />
              <span className="text-[8px] bg-blue-500 text-white px-1 py-0.5 rounded shrink-0">
                {sec.position}% {sec.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

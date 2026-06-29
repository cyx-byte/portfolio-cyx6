"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";
import { CircularNav } from "./CircularNav";
import type { Project } from "@/types";

interface ArticleDetailProps {
  project: Project;
  sectionId: string;
  prevId: string | null;
  nextId: string | null;
  firstId?: string | null;
  lastId?: string | null;
}

export function ArticleDetail({
  project,
  sectionId,
  prevId,
  nextId,
  firstId,
  lastId,
}: ArticleDetailProps) {
  const longImages = (project.drawings || []).filter((d) => d.image).map((d) => d.image);
  const sections = project.drawings?.[0]?.sections?.sort((a, b) => a.position - b.position) || [];
  const [zoom, setZoom] = useState(40);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const paneRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(80); // pixels per second
  const autoRef = useRef(false);
  const speedRef = useRef(scrollSpeed);
  useEffect(() => { speedRef.current = scrollSpeed; }, [scrollSpeed]);
  useEffect(() => { autoRef.current = autoScroll; }, [autoScroll]);

  const MIN_ZOOM = 30;
  const MAX_ZOOM = 150;
  const STEP = 10;

  const applyZoom = useCallback((delta: number) => {
    setZoom((prev) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta));
      if (next <= 100) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Auto-scroll animation loop
  useEffect(() => {
    let raf: number;
    let lastTime = performance.now();
    function tick(now: number) {
      const el = paneRef.current;
      if (!el) { raf = requestAnimationFrame(tick); return; }
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (autoRef.current) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll > 2 && el.scrollTop < maxScroll - 2) {
          el.scrollTop += speedRef.current * dt;
        } else if (maxScroll > 2) {
          setAutoScroll(false);
        }
        // if maxScroll <= 2, content fits — keep autoScroll on, will start when content resizes
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Stop auto-scroll on user interaction + track active section
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    function stop() { if (autoRef.current) setAutoScroll(false); }
    function trackSection() {
      if (!el || sections.length === 0) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      const pct = (el.scrollTop / maxScroll) * 100;
      let active: string | null = null;
      for (const s of sections) {
        if (pct >= s.position - 1) active = s.id;
      }
      setActiveSection(active);
    }
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("scroll", trackSection, { passive: true });
    return () => {
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("scroll", trackSection);
    };
  }, [sections]);

  // Jump to section
  function jumpToSection(position: number) {
    const el = paneRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: (position / 100) * maxScroll, behavior: "smooth" });
  }

  // Alt + mouse wheel zoom
  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      if (e.altKey) {
        e.preventDefault();
        applyZoom(e.deltaY < 0 ? STEP : -STEP);
      }
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [applyZoom]);

  // Drag-to-pan when zoom > 100%
  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 100) return;
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }

  function handleMouseUp() {
    dragging.current = false;
  }

  // Global mouseup to catch release outside the pane
  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="max-w-[900px] mx-auto px-8 pb-24">
      {/* Header: number + title */}
      <motion.div
        className="mb-12"
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

      {/* Cover + Description */}
      <motion.div
        className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Cover image */}
        <div className="w-full md:w-[280px] shrink-0">
          {project.coverImage ? (
            <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover"
                sizes="280px"
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
              封面
            </div>
          )}
        </div>

        {/* Info + Description */}
        <div className="flex-1">
          {/* Info modules */}
          {project.info.length > 0 && (
            <div className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
              {project.info.map((item) => (
                <div key={item.id} className="flex items-baseline gap-2">
                  <span className="text-xs text-stone-400 tracking-[0.1em] uppercase">
                    {item.label}
                  </span>
                  <span className="text-sm text-stone-600">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div
              className="text-stone-600 leading-relaxed text-sm whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(project.description.replace(/\n/g, "<br/>")),
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Long image reading pane */}
      {longImages.length > 0 && (
        <motion.div
          className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50 -mx-4 md:-mx-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Pane header */}
          <div className="px-6 py-3 border-b border-stone-200 bg-white flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 tracking-[0.1em]">阅读窗格</span>
              {/* Auto-scroll toggle */}
              <button
                className={`text-xs px-3 py-1 rounded border transition-colors ${
                  autoScroll
                    ? "bg-stone-800 text-white border-stone-800"
                    : "border-stone-200 text-stone-500 hover:bg-stone-100"
                }`}
                onClick={() => setAutoScroll((v) => !v)}
              >
                {autoScroll ? "⏸ 停止" : "▶ 自动阅读"}
              </button>
              {autoScroll && (
                <input
                  type="range"
                  min="45"
                  max="200"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="w-20 h-2"
                  title={`速度: ${scrollSpeed}px/s`}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-7 h-7 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:bg-stone-100 text-sm"
                onClick={() => applyZoom(-STEP)}
                title="缩小"
              >
                −
              </button>
              <span className="text-xs text-stone-500 w-10 text-center tabular-nums">
                {zoom}%
              </span>
              <button
                className="w-7 h-7 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:bg-stone-100 text-sm"
                onClick={() => applyZoom(STEP)}
                title="放大"
              >
                +
              </button>
            </div>
          </div>

          {/* Body: image + content guide */}
          <div className="flex">
            {/* Scrollable image area */}
            <div
              ref={paneRef}
              className="overflow-y-auto overflow-x-hidden flex-1"
              style={{ maxHeight: "75vh", cursor: zoom > 100 ? "grab" : "default" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {longImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${project.title} - 长图 ${i + 1}`}
                className="h-auto mx-auto block select-none"
                draggable={false}
                style={{
                  width: `${zoom}%`,
                  maxWidth: zoom > 100 ? "none" : `${zoom}%`,
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                  transition: zoom <= 100 ? "transform 0.2s ease-out" : "none",
                }}
              />
              ))}
            </div>

            {/* Content guide sidebar */}
            {sections.length > 0 && (
              <div
                className="w-36 shrink-0 border-l border-stone-200 bg-white overflow-y-auto p-3"
                style={{ maxHeight: "75vh" }}
              >
                <p className="text-[10px] text-stone-400 tracking-[0.1em] uppercase mb-2">
                  内容向导
                </p>
                <div className="space-y-0.5">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      className={`block w-full text-left text-[11px] px-2 py-1 rounded transition-colors ${
                        activeSection === sec.id
                          ? "bg-stone-800 text-white"
                          : "text-stone-500 hover:bg-stone-100"
                      }`}
                      onClick={() => jumpToSection(sec.position)}
                    >
                      {sec.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {longImages.length === 0 && (
        <div className="text-center text-stone-300 py-16 text-sm">
          暂未上传长图
        </div>
      )}

      {/* Prev / Next project navigation (circular, with confirmation dialog) */}
      <CircularNav
        sectionId={sectionId}
        prevId={prevId}
        nextId={nextId}
        firstId={firstId ?? null}
        lastId={lastId ?? null}
        prevLabel="上一篇"
        nextLabel="下一篇"
      />
    </div>
  );
}

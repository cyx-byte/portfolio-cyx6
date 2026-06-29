"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { HomeCover } from "./HomeCover";
import { NameTitle } from "./NameTitle";
import { NavModules } from "./NavModules";

interface HomePageProps {
  name: string;
  title: string;
  homeCoverFront?: string;
  homeCoverBack?: string;
}

const LEAVE_THRESHOLD = 196;

export function HomePage({ name, title, homeCoverFront, homeCoverBack }: HomePageProps) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = Math.abs(e.clientX - centerX);
    const dy = Math.abs(e.clientY - centerY);
    setHovered(dy < LEAVE_THRESHOLD && dx < 220);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center min-h-screen bg-stone-50"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex flex-col items-center -mt-20">
        <HomeCover frontSrc={homeCoverFront} backSrc={homeCoverBack} hovered={hovered} />
        <NameTitle hovered={hovered} name={name} title={title} />
        <motion.div
          className="mt-4"
          animate={{ y: hovered ? -48 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <NavModules visible={hovered} />
        </motion.div>
      </div>
    </div>
  );
}

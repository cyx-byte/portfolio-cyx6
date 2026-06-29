"use client";

import { motion } from "framer-motion";

interface NameTitleProps {
  hovered: boolean;
  name: string;
  title: string;
}

export function NameTitle({ hovered, name, title }: NameTitleProps) {
  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        y: hovered ? -48 : 0,
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Name */}
      <motion.h1
        className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-stone-800"
        animate={{
          opacity: hovered ? 0.35 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {name}
      </motion.h1>

      {/* Title */}
      <motion.p
        className="mt-4 text-sm md:text-base tracking-[0.25em] text-stone-400 uppercase"
        animate={{
          opacity: hovered ? 0.25 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {title}
      </motion.p>
    </motion.div>
  );
}

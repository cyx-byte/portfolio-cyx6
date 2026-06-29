"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HomeCoverProps {
  frontSrc?: string;
  backSrc?: string;
  hovered: boolean;
}

export function HomeCover({ frontSrc, backSrc, hovered }: HomeCoverProps) {
  if (!frontSrc && !backSrc) return null;

  const single = !frontSrc || !backSrc;
  const src = single ? (frontSrc || backSrc) : (hovered ? backSrc : frontSrc);

  if (single && src) {
    return (
      <div className="relative w-[200px] aspect-square mb-[68px]">
        <div className="absolute inset-0 bg-stone-100 overflow-hidden">
          <Image src={src} alt="" fill className="object-cover" sizes="200px" priority />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-[200px] aspect-square mb-[68px]">
      <AnimatePresence mode="wait">
        {!hovered && frontSrc ? (
          <motion.div
            key="front"
            className="absolute inset-0 bg-stone-100 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src={frontSrc} alt="" fill className="object-cover" sizes="200px" priority />
          </motion.div>
        ) : hovered && backSrc ? (
          <motion.div
            key="back"
            className="absolute inset-0 bg-stone-100 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src={backSrc} alt="" fill className="object-cover" sizes="200px" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

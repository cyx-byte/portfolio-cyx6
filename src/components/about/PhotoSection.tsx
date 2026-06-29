"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface PhotoSectionProps {
  photo: string;
  name: string;
  aspectRatio?: string;
}

export function PhotoSection({ photo, name, aspectRatio = "3/4" }: PhotoSectionProps) {
  const isSquare = aspectRatio === "1/1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={`flex flex-col ${isSquare ? "items-center" : "items-start"} gap-6`}
    >
      <div
        className="relative bg-stone-100 overflow-hidden"
        style={{
          width: isSquare ? "180px" : "100%",
          maxWidth: isSquare ? "180px" : "240px",
          aspectRatio: aspectRatio,
        }}
      >
        {photo ? (
          <Image src={photo} alt={name} fill className="object-cover" sizes="300px" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">照片</div>
        )}
      </div>
      <h2 className={`font-serif text-xl tracking-[0.06em] text-stone-800 ${isSquare ? "text-center" : "text-left"}`}>
        {name}
      </h2>
    </motion.div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  sectionId: string;
}

export function ProjectCard({ project, sectionId }: ProjectCardProps) {
  return (
    <Link href={`/${sectionId}/${project.id}`} className="block w-full">
      <motion.div
        className="group cursor-pointer w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Image container — hover: float up + shadow at 45° bottom-right */}
        <div
          className="relative w-full aspect-square bg-stone-100 overflow-hidden
                        transition-all duration-500 ease-out
                        group-hover:-translate-y-2
                        group-hover:shadow-[12px_12px_24px_rgba(0,0,0,0.08),24px_24px_48px_rgba(0,0,0,0.04)]"
        >
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={60}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
              封面图
            </div>
          )}
        </div>

        {/* Title below */}
        <div className="mt-4">
          <p className="text-sm text-stone-400 tracking-[0.1em]">
            {project.number}
          </p>
          <h3 className="text-base text-stone-700 tracking-[0.06em] mt-1 group-hover:text-stone-900 transition-colors">
            {project.title}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}

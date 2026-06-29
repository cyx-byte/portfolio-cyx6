"use client";

import { motion } from "framer-motion";
import type { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  sectionId: string;
  projects: Project[];
}

export function ProjectList({ sectionId, projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="max-w-[960px] mx-auto px-8 pb-24 text-center text-stone-400">
        暂无项目
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto px-8 pb-24">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} sectionId={sectionId} />
        ))}
      </motion.div>
    </div>
  );
}

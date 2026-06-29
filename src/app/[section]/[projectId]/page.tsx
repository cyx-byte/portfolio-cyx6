import { notFound } from "next/navigation";
import { getProject, getAdjacentProjects, getSection, getSiteData } from "@/lib/data";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { ArticleDetail } from "@/components/projects/ArticleDetail";

interface ProjectPageProps {
  params: Promise<{ section: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { section: sectionId, projectId } = await params;
  const result = getProject(sectionId, projectId);
  const section = getSection(sectionId);

  if (!result || !section) {
    notFound();
  }

  const { project } = result;
  const { prevId, nextId, firstId, lastId } = getAdjacentProjects(sectionId, projectId);
  const circular = { firstId, lastId };

  // Articles use a different detail layout (long vertical image reader)
  if (sectionId === "articles") {
    return (
      <div className="flex-1 pt-16">
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-8">
          <a
            href={`/${sectionId}`}
            className="text-sm text-stone-400 hover:text-stone-600 tracking-[0.1em] transition-colors"
          >
            &larr; {section.title}
          </a>
        </div>
        <ArticleDetail
          project={project}
          sectionId={sectionId}
          prevId={prevId}
          nextId={nextId}
          firstId={circular.firstId}
          lastId={circular.lastId}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 pt-16">
      <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-8">
        <a
          href={`/${sectionId}`}
          className="text-sm text-stone-400 hover:text-stone-600 tracking-[0.1em] transition-colors"
        >
          &larr; {section.title}
        </a>
      </div>

      <ProjectDetail
        project={project}
        sectionId={sectionId}
        prevId={prevId}
        nextId={nextId}
        firstId={circular.firstId}
        lastId={circular.lastId}
        drawingLabel={sectionId === "zine" ? "图册" : "图纸"}
        flipAnimation={sectionId !== "architecture"}
      />
    </div>
  );
}

// biome-ignore lint/correctness/noUnusedFunction: Next.js static export
export async function generateStaticParams() {
  const data = getSiteData();
  const params: { section: string; projectId: string }[] = [];
  for (const section of data.sections) {
    if (section.type === "projects" && section.enabled) {
      const projects = (section.data as { projects: import("@/types").Project[] }).projects;
      for (const project of projects) {
        params.push({ section: section.id, projectId: project.id });
      }
    }
  }
  return params;
}

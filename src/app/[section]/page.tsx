import { notFound } from "next/navigation";
import { getSiteData, getSection } from "@/lib/data";
import type { AboutData } from "@/types";
import { PhotoSection } from "@/components/about/PhotoSection";
import { InfoModules } from "@/components/about/InfoModules";
import { ProjectList } from "@/components/projects/ProjectList";

/** English subtitles for each section */
const ENGLISH_TITLES: Record<string, string> = {
  about: "ABOUT ME",
  architecture: "ARCHITECTURE",
  zine: "ZINE",
  articles: "ARTICLES",
  contact: "CONTACT",
};

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section: sectionId } = await params;
  const section = getSection(sectionId);
  const siteData = getSiteData();

  if (!section) {
    notFound();
  }

  const englishTitle = ENGLISH_TITLES[sectionId] || "";

  return (
    <div className="flex-1 pt-16">
      {/* Section title — centered with English subtitle */}
      <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl tracking-[0.06em] text-stone-800">
          {section.title}
        </h1>
        {englishTitle && (
          <p className="mt-3 text-sm tracking-[0.25em] text-stone-400 uppercase">
            {englishTitle}
          </p>
        )}
      </div>

      {/* Render by type */}
      {section.type === "about" && sectionId === "contact" ? (
        /* Contact: photo+name on top, modules below, centered */
        <div className="max-w-[720px] mx-auto px-8 pb-24">
          <div className="flex flex-col items-center gap-14">
            <PhotoSection
              photo={(section.data as AboutData).photo}
              name={siteData.site.name}
              aspectRatio="1/1"
            />
            <InfoModules modules={(section.data as AboutData).modules} centered />
          </div>
        </div>
      ) : section.type === "about" ? (
        /* About: photo left, modules right */
        <div className="max-w-[1200px] mx-auto px-8 pb-24">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14">
            <div className="w-full md:w-[25%] shrink-0">
              <PhotoSection
                photo={(section.data as AboutData).photo}
                name={siteData.site.name}
              />
            </div>
            <div className="w-full md:w-[75%]">
              <InfoModules modules={(section.data as AboutData).modules} />
            </div>
          </div>
        </div>
      ) : (
        /* Projects type — architecture, ZINE, articles */
        <ProjectList
          sectionId={sectionId}
          projects={
            (
              section.data as { projects: import("@/types").Project[] }
            ).projects
          }
        />
      )}
    </div>
  );
}

/** Generate static params for all enabled sections */
export async function generateStaticParams() {
  const data = getSiteData();
  return data.sections
    .filter((s) => s.enabled)
    .map((s) => ({ section: s.id }));
}

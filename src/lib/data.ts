import fs from "fs";
import path from "path";
import type { SiteData, Section, Project } from "@/types";

const DATA_PATH = path.join(process.cwd(), "data", "site.json");

/** Read the full site data from JSON */
export function getSiteData(): SiteData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as SiteData;
}

/** Write the full site data back to JSON */
export function saveSiteData(data: SiteData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

/** Get a single section by its ID */
export function getSection(sectionId: string): Section | undefined {
  const data = getSiteData();
  return data.sections.find((s) => s.id === sectionId && s.enabled);
}

/** Get all enabled sections, sorted by order */
export function getEnabledSections(): Section[] {
  const data = getSiteData();
  return data.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);
}

/** Update a specific section */
export function updateSection(
  sectionId: string,
  updater: (section: Section) => Section
): SiteData {
  const data = getSiteData();
  const idx = data.sections.findIndex((s) => s.id === sectionId);
  if (idx === -1) {
    throw new Error(`Section "${sectionId}" not found`);
  }
  data.sections[idx] = updater(data.sections[idx]);
  saveSiteData(data);
  return data;
}

/** Get a project from a section */
export function getProject(
  sectionId: string,
  projectId: string
): { project: Project; index: number; section: Section } | null {
  const section = getSection(sectionId);
  if (!section || section.type !== "projects") return null;
  const projects = (section.data as { projects: Project[] }).projects;
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1) return null;
  return { project: projects[index], index, section };
}

/** Get prev/next + first/last project IDs for circular navigation */
export function getAdjacentProjects(
  sectionId: string,
  projectId: string
): { prevId: string | null; nextId: string | null; firstId: string | null; lastId: string | null } {
  const section = getSection(sectionId);
  if (!section || section.type !== "projects") {
    return { prevId: null, nextId: null, firstId: null, lastId: null };
  }
  const projects = (section.data as { projects: Project[] }).projects;
  const index = projects.findIndex((p) => p.id === projectId);
  if (index === -1 || projects.length === 0) {
    return { prevId: null, nextId: null, firstId: null, lastId: null };
  }
  return {
    prevId: index > 0 ? projects[index - 1].id : null,
    nextId: index < projects.length - 1 ? projects[index + 1].id : null,
    firstId: projects[0].id,
    lastId: projects[projects.length - 1].id,
  };
}

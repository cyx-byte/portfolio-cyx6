// ============================================================
// Core data types for the portfolio site
// ============================================================

// ---- Table types for info modules ----
// Each row has independent column splits — cells define their own width

export interface TableCell {
  id: string;
  content: string; // rich HTML
  bgColor: string; // hex color or empty
  bgOpacity: number; // 10-100, default 100
  width: string; // e.g. "50%", "33%"
  fontSize: string; // e.g. "16px", applied to cell container
  fontWeight: "normal" | "bold"; // applied to cell container
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableData {
  rows: TableRow[];
}

// ---- Info Module types ----

export interface InfoModuleBase {
  id: string;
  label: string;
  maxWidth?: string; // e.g. "600px", "100%" — controls module display width
}

export interface InfoModuleText extends InfoModuleBase {
  moduleType: "text";
  content: string;
  fontSize: string;
  fontWeight: "normal" | "bold";
}

export interface InfoModuleTable extends InfoModuleBase {
  moduleType: "table";
  table: TableData;
}

export type InfoModule = InfoModuleText | InfoModuleTable;

// ---- Project types ----

export interface ProjectInfo {
  id: string;
  label: string;
  value: string;
}

/** A section marker for long images */
export interface ImageSection {
  id: string;
  title: string;
  position: number; // percentage 0-100 along the image
}

export interface Drawing {
  id: string;
  image: string;
  title: string;
  description: string;
  category?: string;
  sections?: ImageSection[];
}

export interface Project {
  id: string;
  number: string;
  title: string;
  coverImage: string;
  info: ProjectInfo[];
  description: string;
  drawings: Drawing[];
}

// ---- Section types ----

export interface AboutData {
  photo: string;
  modules: InfoModule[];
}

export interface ProjectsData {
  projects: Project[];
}

export type SectionData = AboutData | ProjectsData;

export type SectionType = "about" | "projects";

export interface Section {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  type: SectionType;
  data: SectionData;
}

// ---- Site-wide ----

export interface SiteConfig {
  name: string;
  title: string;
  homeCoverFront?: string;
  homeCoverBack?: string;
}

export interface SiteData {
  site: SiteConfig;
  sections: Section[];
}

// ---- Admin ----

export interface AdminState {
  isAdmin: boolean;
  editing: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

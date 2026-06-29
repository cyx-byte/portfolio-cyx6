"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "./AdminProvider";
import type { SiteData, Section, Project, InfoModule, InfoModuleText, InfoModuleTable, ProjectInfo } from "@/types";
import { RichTextEditor } from "./RichTextEditor";
import { TableEditor } from "./TableEditor";
import { PhotoUploader } from "./PhotoUploader";
import { DrawingViewer } from "@/components/projects/DrawingViewer";

export function AdminDashboard() {
  const { data, refreshData, saveData, logout } = useAdmin();
  const [localData, setLocalData] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (data) {
      setLocalData(JSON.parse(JSON.stringify(data)));
      if (!activeSection && data.sections.length > 0) {
        setActiveSection(data.sections[0].id);
      }
    }
  }, [data, activeSection]);

  async function handleSave() {
    if (!localData) return;
    setSaving(true);
    setMessage("");
    const ok = await saveData(localData);
    setMessage(ok ? "保存成功" : "保存失败");
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  if (!localData) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-400">加载中...</p>
      </div>
    );
  }

  const section = localData.sections.find((s) => s.id === activeSection);

  function updateSite<K extends keyof SiteData["site"]>(
    key: K,
    value: SiteData["site"][K]
  ) {
    setLocalData((prev) =>
      prev ? { ...prev, site: { ...prev.site, [key]: value } } : prev
    );
  }

  function updateSection(sectionId: string, updater: (s: Section) => Section) {
    setLocalData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === sectionId ? updater(s) : s
        ),
      };
    });
  }

  function updateProject(
    sectionId: string,
    projectId: string,
    updater: (p: Project) => Project
  ) {
    updateSection(sectionId, (s) => ({
      ...s,
      data: {
        ...s.data,
        projects: (s.data as { projects: Project[] }).projects.map((p) =>
          p.id === projectId ? updater(p) : p
        ),
      },
    }));
  }

  function addProject(sectionId: string) {
    updateSection(sectionId, (s) => {
      const projects = (s.data as { projects: Project[] }).projects;
      const newId = `proj-${Date.now()}`;
      const num = String(projects.length + 1).padStart(2, "0");
      return {
        ...s,
        data: {
          ...s.data,
          projects: [
            ...projects,
            {
              id: newId,
              number: num,
              title: "新项目",
              coverImage: "",
              info: [
                { id: `i-${Date.now()}-1`, label: "标签", value: "内容" },
              ],
              description: "",
              drawings: [],
            },
          ],
        },
      };
    });
  }

  function deleteProject(sectionId: string, projectId: string) {
    updateSection(sectionId, (s) => ({
      ...s,
      data: {
        ...s.data,
        projects: (s.data as { projects: Project[] }).projects.filter(
          (p) => p.id !== projectId
        ),
      },
    }));
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-100 border-r border-stone-200 p-4 flex flex-col shrink-0">
        <h2 className="text-xs text-stone-400 tracking-[0.15em] uppercase mb-4">
          板块
        </h2>
        {localData.sections.map((s) => (
          <button
            key={s.id}
            className={`text-left px-3 py-2 text-sm rounded-md mb-1 transition-colors ${
              activeSection === s.id
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-200"
            }`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.title}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-stone-200">
          <button
            className="w-full text-left px-3 py-2 text-sm text-stone-500 hover:text-stone-700"
            onClick={logout}
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* Main editor */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Site config */}
        <div className="mb-8 pb-8 border-b border-stone-200">
          <h3 className="text-xs text-stone-400 tracking-[0.15em] uppercase mb-4">
            网站设置
          </h3>
          <div className="grid grid-cols-2 gap-6 max-w-lg">
            <div>
              <label className="block text-xs text-stone-400 mb-1">姓名</label>
              <input
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
                value={localData.site.name}
                onChange={(e) => updateSite("name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">头衔</label>
              <input
                className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400"
                value={localData.site.title}
                onChange={(e) => updateSite("title", e.target.value)}
              />
            </div>
          </div>
          {/* Homepage covers */}
          <div className="max-w-lg space-y-4 mt-6">
            <div className="flex items-center gap-4">
              <span className="text-xs text-stone-400 w-16">首页封面（前）</span>
              <PhotoUploader
                currentPhoto={localData.site.homeCoverFront || ""}
                onChange={(url) => updateSite("homeCoverFront", url)}
                aspectRatio={1}
                previewClassName="w-20 aspect-square"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-stone-400 w-16">首页封面（后）</span>
              <PhotoUploader
                currentPhoto={localData.site.homeCoverBack || ""}
                onChange={(url) => updateSite("homeCoverBack", url)}
                aspectRatio={1}
                previewClassName="w-20 aspect-square"
              />
            </div>
          </div>
        </div>

        {/* Section editor */}
        {section && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-lg font-serif text-stone-800 tracking-[0.06em]">
                {section.title}
              </h3>
            </div>

            {section.type === "about" ? (
              <AboutEditor
                section={section}
                onChange={(updater) => updateSection(section.id, updater)}
              />
            ) : (
              <ProjectsEditor
                section={section}
                drawingLabel={section.id === "articles" ? "长图" : section.id === "zine" ? "图册" : "图纸"}
                onUpdateProject={(projectId, updater) =>
                  updateProject(section.id, projectId, updater)
                }
                onAddProject={() => addProject(section.id)}
                onDeleteProject={(projectId) =>
                  deleteProject(section.id, projectId)
                }
              />
            )}
          </div>
        )}

        {/* Save bar */}
        <div className="fixed bottom-0 left-56 right-0 bg-white border-t border-stone-200 px-8 py-3 flex items-center justify-between">
          {message && (
            <span
              className={`text-sm ${
                message === "保存成功" ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </span>
          )}
          <div className="flex-1" />
          <button
            className="px-8 py-2 bg-stone-800 text-white text-sm tracking-[0.1em] rounded-md hover:bg-stone-700 disabled:opacity-40 transition-all"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存全部更改"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// About Editor
// ============================================================

function AboutEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (updater: (s: Section) => Section) => void;
}) {
  const data = section.data as { photo: string; modules: InfoModule[] };

  function updateModule(moduleId: string, updater: (m: InfoModule) => InfoModule) {
    onChange((s) => ({
      ...s,
      data: {
        ...s.data,
        modules: data.modules.map((m) =>
          m.id === moduleId ? updater(m) : m
        ),
      },
    }));
  }

  function addTextModule() {
    const newMod: InfoModuleText = {
      id: `m-${Date.now()}`,
      moduleType: "text",
      label: "新模块",
      content: "",
      fontSize: "16px",
      fontWeight: "normal",
    };
    onChange((s) => ({
      ...s,
      data: { ...s.data, modules: [...data.modules, newMod] },
    }));
  }

  function addTableModule() {
    const newMod: InfoModuleTable = {
      id: `m-${Date.now()}`,
      moduleType: "table",
      label: "新表格",
      table: {
        rows: [
          {
            id: `row-${Date.now()}`,
            cells: [
              { id: `cell-${Date.now()}-1`, content: "", bgColor: "", bgOpacity: 100, width: "50%", fontSize: "14px", fontWeight: "normal" as const },
              { id: `cell-${Date.now()}-2`, content: "", bgColor: "", bgOpacity: 100, width: "50%", fontSize: "14px", fontWeight: "normal" as const },
            ],
          },
        ],
      },
    };
    onChange((s) => ({
      ...s,
      data: { ...s.data, modules: [...data.modules, newMod] },
    }));
  }

  function deleteModule(moduleId: string) {
    onChange((s) => ({
      ...s,
      data: {
        ...s.data,
        modules: data.modules.filter((m) => m.id !== moduleId),
      },
    }));
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Photo */}
      <div>
        <label className="block text-xs text-stone-400 mb-2">照片</label>
        <PhotoUploader
          currentPhoto={data.photo}
          onChange={(url) => onChange((s) => ({ ...s, data: { ...s.data, photo: url } }))}
          aspectRatio={section.id === "contact" ? 1 : 3 / 4}
          previewClassName={section.id === "contact" ? "w-32 aspect-square" : "w-32 h-40"}
        />
      </div>

      {/* Modules */}
      <div>
        <label className="block text-xs text-stone-400 mb-2">信息模块</label>
        <div className="space-y-6">
          {data.modules.map((mod) => (
            <div
              key={mod.id}
              className="p-4 border border-stone-200 rounded-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <input
                  className="w-28 border border-stone-200 rounded px-2 py-1 text-xs text-stone-600"
                  value={mod.label}
                  placeholder="标签"
                  onChange={(e) =>
                    updateModule(mod.id, (m) => ({ ...m, label: e.target.value }))
                  }
                />
                <input
                  className="w-20 border border-stone-200 rounded px-2 py-1 text-[10px] text-stone-500"
                  value={mod.maxWidth || ""}
                  placeholder="宽度"
                  title="展示宽度，如600px或80%"
                  onChange={(e) =>
                    updateModule(mod.id, (m) => ({ ...m, maxWidth: e.target.value }))
                  }
                />
                <span className="text-[10px] text-stone-300 bg-stone-100 px-2 py-0.5 rounded">
                  {mod.moduleType === "table" ? "表格" : "文本"}
                </span>
                <button
                  className="text-xs text-red-400 hover:text-red-600 ml-auto"
                  onClick={() => deleteModule(mod.id)}
                >
                  删除
                </button>
              </div>

              {mod.moduleType === "table" ? (
                <TableEditor
                  table={(mod as InfoModuleTable).table}
                  onChange={(table) =>
                    updateModule(mod.id, (m) =>
                      m.moduleType === "table"
                        ? { ...(m as InfoModuleTable), table }
                        : m
                    )
                  }
                />
              ) : (
                <RichTextEditor
                  value={(mod as InfoModuleText).content}
                  onChange={(html) =>
                    updateModule(mod.id, (m) =>
                      m.moduleType === "text"
                        ? { ...(m as InfoModuleText), content: html }
                        : m
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button
            className="text-xs text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded-md px-4 py-2"
            onClick={addTextModule}
          >
            + 文本模块
          </button>
          <button
            className="text-xs text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded-md px-4 py-2"
            onClick={addTableModule}
          >
            + 表格模块
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Projects Editor
// ============================================================

function ProjectsEditor({
  section,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  drawingLabel = "图纸",
}: {
  section: Section;
  onUpdateProject: (
    projectId: string,
    updater: (p: Project) => Project
  ) => void;
  onAddProject: () => void;
  onDeleteProject: (projectId: string) => void;
  drawingLabel?: string;
}) {
  const projects = (section.data as { projects: Project[] }).projects;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ projectId: string; drawingIdx: number } | null>(null);
  // Batch category state
  const [batchChecked, setBatchChecked] = useState<Set<string>>(new Set());
  const [batchInput, setBatchInput] = useState("");

  return (
    <>
    <div className="max-w-3xl space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="border border-stone-200 rounded-md overflow-hidden"
        >
          {/* Project header */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === project.id ? null : project.id)
            }
          >
            <span className="text-xs text-stone-400 font-mono">
              {project.number}
            </span>
            <span className="text-sm text-stone-700 flex-1">
              {project.title || "未命名项目"}
            </span>
            <span className="text-xs text-stone-300">
              {expandedId === project.id ? "收起" : "展开"}
            </span>
          </button>

          {/* Expanded editor */}
          {expandedId === project.id && (
            <div className="border-t border-stone-200 p-4 space-y-4 bg-stone-50/50">
              {/* Number & Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">
                    序号
                  </label>
                  <input
                    className="w-full border border-stone-200 rounded px-3 py-1.5 text-xs"
                    value={project.number}
                    onChange={(e) =>
                      onUpdateProject(project.id, (p) => ({
                        ...p,
                        number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">
                    标题
                  </label>
                  <input
                    className="w-full border border-stone-200 rounded px-3 py-1.5 text-xs"
                    value={project.title}
                    onChange={(e) =>
                      onUpdateProject(project.id, (p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs text-stone-400 mb-1">
                  封面图
                </label>
                <PhotoUploader
                  currentPhoto={project.coverImage}
                  onChange={(url) =>
                    onUpdateProject(project.id, (p) => ({ ...p, coverImage: url }))
                  }
                  aspectRatio={1}
                  previewClassName="w-24 aspect-square"
                />
              </div>

              {/* Info fields */}
              <div>
                <label className="block text-xs text-stone-400 mb-1">
                  项目信息
                </label>
                <div className="space-y-2">
                  {project.info.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        className="w-24 border border-stone-200 rounded px-2 py-1 text-xs"
                        value={item.label}
                        placeholder="标签"
                        onChange={(e) =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            info: p.info.map((i) =>
                              i.id === item.id
                                ? { ...i, label: e.target.value }
                                : i
                            ),
                          }))
                        }
                      />
                      <input
                        className="flex-1 border border-stone-200 rounded px-2 py-1 text-xs"
                        value={item.value}
                        placeholder="值"
                        onChange={(e) =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            info: p.info.map((i) =>
                              i.id === item.id
                                ? { ...i, value: e.target.value }
                                : i
                            ),
                          }))
                        }
                      />
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            info: p.info.filter((i) => i.id !== item.id),
                          }))
                        }
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-2 text-xs text-stone-400 hover:text-stone-600"
                  onClick={() =>
                    onUpdateProject(project.id, (p) => ({
                      ...p,
                      info: [
                        ...p.info,
                        {
                          id: `i-${Date.now()}`,
                          label: "新标签",
                          value: "",
                        },
                      ],
                    }))
                  }
                >
                  + 添加信息项
                </button>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-stone-400 mb-1">
                  描述
                </label>
                <RichTextEditor
                  value={project.description}
                  onChange={(html) =>
                    onUpdateProject(project.id, (p) => ({
                      ...p,
                      description: html,
                    }))
                  }
                />
              </div>

              {/* Drawings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-stone-400">{drawingLabel}</label>
                  {/* Batch upload */}
                  {/* Batch category */}
                  <div className="flex items-center gap-2">
                    <button
                      className="text-[10px] text-stone-400 hover:text-stone-600"
                      onClick={() => {
                        if (batchChecked.size === project.drawings.length) {
                          setBatchChecked(new Set());
                        } else {
                          setBatchChecked(new Set(project.drawings.map((d: { id: string }) => d.id)));
                        }
                      }}
                    >
                      {batchChecked.size === project.drawings.length ? "取消全选" : `全选(${project.drawings.length})`}
                    </button>
                    {batchChecked.size > 0 && (
                      <span className="text-[10px] text-stone-400">已选{batchChecked.size}张</span>
                    )}
                    <input
                      className="w-24 border border-stone-200 rounded px-1.5 py-0.5 text-[10px]"
                      placeholder="设分类为..."
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && batchInput) {
                          const ids = batchChecked.size > 0 ? batchChecked : new Set(project.drawings.map((d: { id: string }) => d.id));
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            drawings: p.drawings.map((d) => ids.has(d.id) ? { ...d, category: batchInput } : d),
                          }));
                          setBatchInput(""); setBatchChecked(new Set());
                        }
                      }}
                    />
                    <button
                      className="text-[10px] px-2 py-0.5 border border-stone-300 rounded text-stone-500 hover:bg-stone-100"
                      onClick={() => {
                        if (!batchInput) return;
                        const ids = batchChecked.size > 0 ? batchChecked : new Set(project.drawings.map((d: { id: string }) => d.id));
                        onUpdateProject(project.id, (p) => ({
                          ...p,
                          drawings: p.drawings.map((d) => ids.has(d.id) ? { ...d, category: batchInput } : d),
                        }));
                        setBatchInput(""); setBatchChecked(new Set());
                      }}
                    >
                      应用
                    </button>
                  </div>

                  <label className="cursor-pointer text-xs text-stone-500 hover:text-stone-700 border border-stone-300 rounded px-3 py-1">
                    批量上传
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || files.length === 0) return;
                        const startNum = project.drawings.length;
                        const newDrawings = [...project.drawings];
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const json = await res.json();
                          const num = String(startNum + i + 1).padStart(2, "0");
                          newDrawings.push({
                            id: `d-${Date.now()}-${i}`,
                            image: json.success && json.data?.url ? json.data.url : "",
                            title: num,
                            description: "",
                          });
                        }
                        onUpdateProject(project.id, () => ({ ...project, drawings: newDrawings }));
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  {project.drawings.map((drawing, idx) => (
                    <div
                      key={drawing.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(idx))}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = Number(e.dataTransfer.getData("text/plain"));
                        const to = idx;
                        if (from === to) return;
                        const list = [...project.drawings];
                        const [moved] = list.splice(from, 1);
                        list.splice(to, 0, moved);
                        // Re-number
                        const renum = list.map((d, i) => ({
                          ...d,
                          title: d.title ? String(i + 1).padStart(2, "0") : d.title,
                        }));
                        onUpdateProject(project.id, () => ({ ...project, drawings: renum }));
                      }}
                      className="flex items-center gap-2 p-2 border border-stone-200 rounded bg-white hover:bg-stone-50/50 transition-colors cursor-default"
                    >
                      {/* Checkbox for batch selection */}
                      <input
                        type="checkbox"
                        className="w-3 h-3 shrink-0 accent-stone-600"
                        checked={batchChecked.has(drawing.id)}
                        onChange={() => {
                          setBatchChecked((prev) => {
                            const next = new Set(prev);
                            if (next.has(drawing.id)) next.delete(drawing.id);
                            else next.add(drawing.id);
                            return next;
                          });
                        }}
                      />

                      {/* Drag handle */}
                      <span className="text-stone-300 cursor-grab text-xs shrink-0 select-none" title="拖动排序">
                        ⠿
                      </span>

                      {/* Number (auto-display) */}
                      <span className="text-[10px] text-stone-300 font-mono w-6 text-center shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      {/* Image indicator — click to preview */}
                      <button
                        className={`w-2 h-2 rounded-full shrink-0 ${drawing.image ? "bg-green-400 hover:bg-green-500 cursor-pointer" : "bg-stone-200"}`}
                        title={drawing.image ? "点击预览" : "未上传"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (drawing.image) setPreview({ projectId: project.id, drawingIdx: idx });
                        }}
                      />

                      {/* Category */}
                      <input
                        className="w-16 border border-stone-200 rounded px-1.5 py-1 text-[10px]"
                        value={drawing.category || ""}
                        placeholder="分类"
                        onChange={(e) =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            drawings: p.drawings.map((d) =>
                              d.id === drawing.id ? { ...d, category: e.target.value } : d
                            ),
                          }))
                        }
                      />

                      {/* Title */}
                      <input
                        className="w-24 border border-stone-200 rounded px-2 py-1 text-xs"
                        value={drawing.title}
                        placeholder="题头"
                        onChange={(e) =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            drawings: p.drawings.map((d) =>
                              d.id === drawing.id ? { ...d, title: e.target.value } : d
                            ),
                          }))
                        }
                      />

                      {/* Description */}
                      <textarea
                        className="flex-1 border border-stone-200 rounded px-2 py-1 text-xs min-h-[3em] resize-y"
                        value={drawing.description}
                        placeholder="说明文字（多行）"
                        rows={2}
                        onChange={(e) =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            drawings: p.drawings.map((d) =>
                              d.id === drawing.id ? { ...d, description: e.target.value } : d
                            ),
                          }))
                        }
                      />

                      {/* Single upload */}
                      <label className="cursor-pointer text-[10px] text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded px-1.5 py-0.5 shrink-0">
                        {drawing.image ? "换" : "图"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const fd = new FormData();
                            fd.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const json = await res.json();
                            if (json.success && json.data?.url) {
                              onUpdateProject(project.id, (p) => ({
                                ...p,
                                drawings: p.drawings.map((d) =>
                                  d.id === drawing.id ? { ...d, image: json.data.url } : d
                                ),
                              }));
                            }
                          }}
                        />
                      </label>

                      {/* Delete */}
                      <button
                        className="text-xs text-red-300 hover:text-red-500 shrink-0"
                        onClick={() =>
                          onUpdateProject(project.id, (p) => ({
                            ...p,
                            drawings: p.drawings.filter((d) => d.id !== drawing.id),
                          }))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-2 text-xs text-stone-400 hover:text-stone-600 border border-dashed border-stone-300 rounded px-3 py-1.5 w-full"
                  onClick={() => {
                    const num = String(project.drawings.length + 1).padStart(2, "0");
                    onUpdateProject(project.id, (p) => ({
                      ...p,
                      drawings: [
                        ...p.drawings,
                        { id: `d-${Date.now()}`, image: "", title: num, description: "" },
                      ],
                    }));
                  }}
                >
                  + 添加{drawingLabel}
                </button>
              </div>

              {/* Delete project */}
              <div className="pt-2 border-t border-stone-200">
                <button
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={() => {
                    if (confirm("确认删除此项目？")) {
                      onDeleteProject(project.id);
                    }
                  }}
                >
                  删除此项目
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        className="w-full py-3 border border-dashed border-stone-300 rounded-md text-sm text-stone-400 hover:text-stone-600 hover:border-stone-400 transition-colors"
        onClick={onAddProject}
      >
        + 添加项目
      </button>
    </div>

    {/* Drawing preview — for checking order */}
    {preview && (() => {
      const proj = projects.find((p) => p.id === preview.projectId);
      if (!proj) return null;
      return (
        <DrawingViewer
          drawings={proj.drawings}
          currentIndex={preview.drawingIdx}
          onClose={() => setPreview(null)}
          onNavigate={(idx) => setPreview({ projectId: preview.projectId, drawingIdx: idx })}
          adminMode
          sections={proj.drawings[preview.drawingIdx]?.sections || []}
          onAddSection={(title, position) => {
            onUpdateProject(preview.projectId, (p) => ({
              ...p,
              drawings: p.drawings.map((d, i) =>
                i === preview.drawingIdx
                  ? { ...d, sections: [...(d.sections || []), { id: `sec-${Date.now()}`, title, position }] }
                  : d
              ),
            }));
          }}
        />
      );
    })()}
  </>);
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSiteData, saveSiteData } from "@/lib/data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 }
    );
  }

  const data = getSiteData();
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "未授权" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    saveSiteData(body);
    revalidatePath("/", "layout");
    // Also revalidate all section pages specifically
    const sections = body.sections || [];
    for (const s of sections) {
      if (s.enabled) {
        revalidatePath(`/${s.id}`);
        if (s.type === "projects") {
          const projects = (s.data as { projects: { id: string }[] }).projects || [];
          for (const p of projects) {
            revalidatePath(`/${s.id}/${p.id}`);
          }
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "保存失败" },
      { status: 500 }
    );
  }
}

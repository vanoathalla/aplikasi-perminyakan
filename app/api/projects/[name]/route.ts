import { NextRequest, NextResponse } from "next/server";
import { loadProject, deleteProject } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const project = loadProject(decodeURIComponent(name));
    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal memuat proyek", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const result = deleteProject(decodeURIComponent(name));
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus proyek", detail: String(err) },
      { status: 500 }
    );
  }
}

// GET  /api/projects  — ambil semua nama proyek
// POST /api/projects  — simpan proyek baru / update

import { NextRequest, NextResponse } from "next/server";
import { getAllProjectNames, saveProject, type ProjectRecord } from "@/lib/db";

export async function GET() {
  try {
    const names = getAllProjectNames();
    return NextResponse.json({ names });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil daftar proyek", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProjectRecord;
    const result = saveProject(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menyimpan proyek", detail: String(err) },
      { status: 500 }
    );
  }
}

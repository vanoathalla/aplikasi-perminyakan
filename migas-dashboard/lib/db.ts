// ============================================================
// DATABASE LAYER — SQLite via better-sqlite3
// Setara dengan db_config.py dari laporan (MySQL XAMPP)
// tapi tanpa perlu install server eksternal apapun.
// ============================================================

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Simpan file database di root project
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "oil_gas_projects.db");

// Pastikan folder data ada
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Singleton connection
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL"); // performa lebih baik
    initSchema(_db);
  }
  return _db;
}

// ── Schema — setara tabel `projects` di MySQL laporan ──────
function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name          TEXT    NOT NULL UNIQUE,
      project_duration      INTEGER NOT NULL,
      capital_investment    REAL    NOT NULL,
      non_capital_investment REAL   NOT NULL,
      production_year_1     REAL    NOT NULL,
      production_year_2     REAL    NOT NULL,
      production_year_3     REAL    NOT NULL,
      production_year_4     REAL    NOT NULL,
      production_year_5     REAL    NOT NULL,
      production_year_6     REAL    NOT NULL,
      production_year_7     REAL    NOT NULL,
      decline_rate          REAL    NOT NULL,
      oil_price             REAL    NOT NULL,
      opex_per_year         REAL    NOT NULL,
      depreciation_method   TEXT    NOT NULL,
      tax_rate              REAL    NOT NULL,
      discount_rate         REAL    NOT NULL,
      created_at            TEXT    DEFAULT (datetime('now')),
      updated_at            TEXT    DEFAULT (datetime('now'))
    )
  `);
}

// ── Tipe data proyek ───────────────────────────────────────
export interface ProjectRecord {
  id?: number;
  project_name: string;
  project_duration: number;
  capital_investment: number;
  non_capital_investment: number;
  production_year_1: number;
  production_year_2: number;
  production_year_3: number;
  production_year_4: number;
  production_year_5: number;
  production_year_6: number;
  production_year_7: number;
  decline_rate: number;
  oil_price: number;
  opex_per_year: number;
  depreciation_method: string;
  tax_rate: number;
  discount_rate: number;
  created_at?: string;
  updated_at?: string;
}

// ── CRUD Functions ─────────────────────────────────────────

/** Ambil semua nama proyek (urut terbaru diubah) */
export function getAllProjectNames(): string[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT project_name FROM projects ORDER BY updated_at DESC")
    .all() as { project_name: string }[];
  return rows.map((r) => r.project_name);
}

/** Muat satu proyek berdasarkan nama */
export function loadProject(projectName: string): ProjectRecord | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM projects WHERE project_name = ?")
    .get(projectName) as ProjectRecord | undefined;
  return row ?? null;
}

/** Simpan proyek — upsert (insert atau update jika sudah ada) */
export function saveProject(data: ProjectRecord): { success: boolean; message: string } {
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM projects WHERE project_name = ?")
    .get(data.project_name);

  if (existing) {
    // UPDATE
    db.prepare(`
      UPDATE projects SET
        project_duration       = ?,
        capital_investment     = ?,
        non_capital_investment = ?,
        production_year_1      = ?,
        production_year_2      = ?,
        production_year_3      = ?,
        production_year_4      = ?,
        production_year_5      = ?,
        production_year_6      = ?,
        production_year_7      = ?,
        decline_rate           = ?,
        oil_price              = ?,
        opex_per_year          = ?,
        depreciation_method    = ?,
        tax_rate               = ?,
        discount_rate          = ?,
        updated_at             = datetime('now')
      WHERE project_name = ?
    `).run(
      data.project_duration,
      data.capital_investment,
      data.non_capital_investment,
      data.production_year_1,
      data.production_year_2,
      data.production_year_3,
      data.production_year_4,
      data.production_year_5,
      data.production_year_6,
      data.production_year_7,
      data.decline_rate,
      data.oil_price,
      data.opex_per_year,
      data.depreciation_method,
      data.tax_rate,
      data.discount_rate,
      data.project_name
    );
    return { success: true, message: `Proyek '${data.project_name}' berhasil diperbarui.` };
  } else {
    // INSERT
    db.prepare(`
      INSERT INTO projects (
        project_name, project_duration, capital_investment, non_capital_investment,
        production_year_1, production_year_2, production_year_3, production_year_4,
        production_year_5, production_year_6, production_year_7,
        decline_rate, oil_price, opex_per_year, depreciation_method,
        tax_rate, discount_rate
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      data.project_name,
      data.project_duration,
      data.capital_investment,
      data.non_capital_investment,
      data.production_year_1,
      data.production_year_2,
      data.production_year_3,
      data.production_year_4,
      data.production_year_5,
      data.production_year_6,
      data.production_year_7,
      data.decline_rate,
      data.oil_price,
      data.opex_per_year,
      data.depreciation_method,
      data.tax_rate,
      data.discount_rate
    );
    return { success: true, message: `Proyek '${data.project_name}' berhasil disimpan.` };
  }
}

/** Hapus proyek berdasarkan nama */
export function deleteProject(projectName: string): { success: boolean; message: string } {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM projects WHERE project_name = ?")
    .run(projectName);

  if (result.changes > 0) {
    return { success: true, message: `Proyek '${projectName}' berhasil dihapus.` };
  }
  return { success: false, message: `Proyek '${projectName}' tidak ditemukan.` };
}

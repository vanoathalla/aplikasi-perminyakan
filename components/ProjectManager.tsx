"use client";

import { useState, useEffect } from "react";
import type { ProjectParams } from "@/lib/calculations";

interface ProjectManagerProps {
  currentParams: ProjectParams;
  onLoad: (params: ProjectParams) => void;
}

type ToastType = "sukses" | "error" | "info";
interface Toast { type: ToastType; message: string; }

const TOAST_STYLE: Record<ToastType, { border: string; icon: React.ReactNode }> = {
  sukses: {
    border: "#4ade80",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="#4ade80" strokeWidth={2} width={14} height={14}>
        <polyline points="3 8 6.5 11.5 13 5" />
      </svg>
    ),
  },
  error: {
    border: "#f87171",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="#f87171" strokeWidth={2} width={14} height={14}>
        <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
      </svg>
    ),
  },
  info: {
    border: "#4f8ef7",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="#4f8ef7" strokeWidth={2} width={14} height={14}>
        <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="5.5" strokeWidth={2.5} /><line x1="8" y1="7.5" x2="8" y2="11" />
      </svg>
    ),
  },
};

const IconFolder = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
    <path d="M2 4a1 1 0 0 1 1-1h3l1.5 2H13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
    <path d="M13 13H3a1 1 0 0 1-1-1V3l2-1h7l2 2v8a1 1 0 0 1-1 1z" />
    <rect x="5" y="9" width="6" height="4" /><rect x="5" y="2" width="5" height="3" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
    <polyline points="3 5 13 5" /><path d="M6 5V3h4v2" />
    <path d="M4 5l1 9h6l1-9" /><line x1="6.5" y1="7" x2="6.5" y2="11" /><line x1="9.5" y1="7" x2="9.5" y2="11" />
  </svg>
);

export default function ProjectManager({ currentParams, onLoad }: ProjectManagerProps) {
  const [projectNames, setProjectNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string>("");
  const [saveName, setSaveName]         = useState<string>("");
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState<Toast | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { fetchNames(); }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function fetchNames() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjectNames(data.names ?? []);
    } catch { /* silent */ }
  }

  async function handleLoad() {
    if (!selectedName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedName)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const params: ProjectParams = {
        projectDuration:      data.project_duration,
        capitalInvestment:    data.capital_investment,
        nonCapitalInvestment: data.non_capital_investment,
        productionYears: [
          data.production_year_1, data.production_year_2, data.production_year_3,
          data.production_year_4, data.production_year_5, data.production_year_6, data.production_year_7,
        ],
        declineRate:        data.decline_rate,
        oilPrice:           data.oil_price,
        opexPerYear:        data.opex_per_year,
        depreciationMethod: data.depreciation_method as ProjectParams["depreciationMethod"],
        taxRate:            data.tax_rate,
        discountRate:       data.discount_rate,
      };
      onLoad(params);
      setSaveName(selectedName);
      setToast({ type: "sukses", message: `Proyek "${selectedName}" berhasil dimuat.` });
    } catch {
      setToast({ type: "error", message: "Gagal memuat proyek." });
    } finally { setLoading(false); }
  }

  async function handleSave() {
    const name = saveName.trim();
    if (!name) { setToast({ type: "error", message: "Nama proyek tidak boleh kosong." }); return; }
    if (currentParams.projectDuration < 7) { setToast({ type: "error", message: "Jangka waktu minimal 7 tahun." }); return; }
    setLoading(true);
    try {
      const body = {
        project_name: name, project_duration: currentParams.projectDuration,
        capital_investment: currentParams.capitalInvestment,
        non_capital_investment: currentParams.nonCapitalInvestment,
        production_year_1: currentParams.productionYears[0], production_year_2: currentParams.productionYears[1],
        production_year_3: currentParams.productionYears[2], production_year_4: currentParams.productionYears[3],
        production_year_5: currentParams.productionYears[4], production_year_6: currentParams.productionYears[5],
        production_year_7: currentParams.productionYears[6],
        decline_rate: currentParams.declineRate, oil_price: currentParams.oilPrice,
        opex_per_year: currentParams.opexPerYear, depreciation_method: currentParams.depreciationMethod,
        tax_rate: currentParams.taxRate, discount_rate: currentParams.discountRate,
      };
      const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setToast({ type: "sukses", message: result.message }); await fetchNames(); setSelectedName(name); }
      else setToast({ type: "error", message: result.message ?? "Gagal menyimpan." });
    } catch { setToast({ type: "error", message: "Gagal menghubungi server." }); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!selectedName) { setToast({ type: "info", message: "Pilih proyek yang ingin dihapus." }); return; }
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true); setConfirmDelete(false);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedName)}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setToast({ type: "sukses", message: result.message });
        setSelectedName(""); setSaveName(""); await fetchNames();
      } else setToast({ type: "error", message: result.message });
    } catch { setToast({ type: "error", message: "Gagal menghapus proyek." }); }
    finally { setLoading(false); }
  }

  const base: React.CSSProperties = {
    padding: "8px 0", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
    border: "1px solid", cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.5 : 1, transition: "all 0.15s", width: "100%",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
          background: "#1c2333", border: `1px solid ${TOAST_STYLE[toast.type].border}`,
          borderRadius: "8px", padding: "11px 16px", fontSize: "13px", color: "#e8eaf0",
          maxWidth: "300px", boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", gap: "10px",
          animation: "fadeUp 0.25s ease",
        }}>
          {TOAST_STYLE[toast.type].icon}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{
            background: "none", border: "none", color: "#4a5568",
            cursor: "pointer", fontSize: "16px", padding: "0 2px", lineHeight: 1,
          }}>×</button>
        </div>
      )}

      {/* Pilih proyek */}
      <div style={{ marginBottom: "8px" }}>
        <label className="input-label">Proyek Tersimpan</label>
        <select value={selectedName} onChange={(e) => {
          setSelectedName(e.target.value); setConfirmDelete(false);
          if (e.target.value) setSaveName(e.target.value);
        }}>
          <option value="">— Proyek Baru —</option>
          {projectNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <button onClick={handleLoad} disabled={!selectedName || loading} style={{
        ...base, marginBottom: "12px",
        background: selectedName ? "rgba(79,142,247,0.12)" : "rgba(255,255,255,0.03)",
        color: selectedName ? "#4f8ef7" : "#4a5568",
        borderColor: selectedName ? "rgba(79,142,247,0.3)" : "#1e2840",
      }}>
        <IconFolder /> Muat Proyek
      </button>

      {/* Nama proyek */}
      <div style={{ marginBottom: "8px" }}>
        <label className="input-label">Nama Proyek</label>
        <input type="text" placeholder="cth. Lapangan Minyak A" value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
        <button onClick={handleSave} disabled={loading} style={{
          ...base, background: "rgba(74,222,128,0.08)", color: "#4ade80",
          borderColor: "rgba(74,222,128,0.25)",
        }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.16)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.08)"; }}
        >
          <IconSave /> Simpan
        </button>

        <button onClick={handleDelete} disabled={loading} style={{
          ...base,
          background: confirmDelete ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.06)",
          color: "#f87171",
          borderColor: confirmDelete ? "rgba(248,113,113,0.5)" : "rgba(248,113,113,0.2)",
        }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.16)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = confirmDelete ? "rgba(248,113,113,0.2)" : "rgba(248,113,113,0.06)"; }}
        >
          <IconTrash /> {confirmDelete ? "Yakin?" : "Hapus"}
        </button>
      </div>

      {confirmDelete && (
        <p style={{ fontSize: "11px", color: "#f87171", marginTop: "6px", textAlign: "center" }}>
          Klik Hapus lagi untuk konfirmasi penghapusan &quot;{selectedName}&quot;
        </p>
      )}

      {projectNames.length > 0 && (
        <p style={{ marginTop: "8px", fontSize: "10px", color: "#4a5568", textAlign: "center" }}>
          {projectNames.length} proyek tersimpan
        </p>
      )}
    </div>
  );
}

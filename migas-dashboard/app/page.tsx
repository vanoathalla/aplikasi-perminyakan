"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import KpiCard from "@/components/KpiCard";
import { NumberInput, SliderInput, SelectInput, SectionHeader } from "@/components/SidebarInput";
import DataTable from "@/components/DataTable";
import ProjectManager from "@/components/ProjectManager";
import { calculate, exportToCSV, formatCurrency, type ProjectParams } from "@/lib/calculations";

const ProductionChart  = dynamic(() => import("@/components/Charts").then((m) => m.ProductionChart),  { ssr: false });
const CashFlowTrendChart = dynamic(() => import("@/components/Charts").then((m) => m.CashFlowTrendChart), { ssr: false });
const CumulativeBarChart = dynamic(() => import("@/components/Charts").then((m) => m.CumulativeBarChart), { ssr: false });

const DEFAULT_PARAMS: ProjectParams = {
  projectDuration: 20,
  capitalInvestment: 13000,
  nonCapitalInvestment: 8000,
  productionYears: [175, 201, 217, 198, 192.06, 186.29, 180.70],
  declineRate: 3.0,
  oilPrice: 32,
  opexPerYear: 180,
  depreciationMethod: "Straight Line",
  taxRate: 51,
  discountRate: 10,
};

/* ── SVG Icons ─────────────────────────────────────────── */
const IcTrend = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <polyline points="2 14 7 8 11 11 18 4" /><polyline points="14 4 18 4 18 8" />
  </svg>
);
const IcClock = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <circle cx="10" cy="10" r="8" /><polyline points="10 5 10 10 13.5 12" />
  </svg>
);
const IcPercent = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <line x1="16" y1="4" x2="4" y2="16" />
    <circle cx="5.5" cy="5.5" r="2" /><circle cx="14.5" cy="14.5" r="2" />
  </svg>
);
const IcWallet = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <rect x="2" y="5" width="16" height="12" rx="2" />
    <path d="M2 9h16" /><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IcDroplet = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20}>
    <path d="M10 2C7 7 4 10 4 13a6 6 0 0 0 12 0c0-3-3-6-6-11z" />
  </svg>
);
const IcMenu = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <line x1="3" y1="5" x2="17" y2="5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="15" x2="17" y2="15" />
  </svg>
);
const IcDownload = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
    <path d="M10 3v10M6 9l4 4 4-4" /><path d="M3 16h14" />
  </svg>
);
const IcBarChart = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
    <rect x="3" y="10" width="3" height="7" /><rect x="8.5" y="6" width="3" height="11" /><rect x="14" y="3" width="3" height="14" />
  </svg>
);
const IcTable = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={15} height={15}>
    <rect x="2" y="3" width="16" height="14" rx="1.5" />
    <line x1="2" y1="8" x2="18" y2="8" /><line x1="8" y1="8" x2="8" y2="17" />
  </svg>
);
const IcRefresh = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={14} height={14}>
    <path d="M4 10a6 6 0 1 1 1.5 4" /><polyline points="1 12 4 10 6 13" />
  </svg>
);
const IcAlert = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={18} height={18}>
    <path d="M10 3L2 17h16L10 3z" /><line x1="10" y1="9" x2="10" y2="12" /><circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const IcSettings = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
  </svg>
);
const IcMoney = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <rect x="2" y="5" width="16" height="10" rx="1.5" />
    <circle cx="10" cy="10" r="2.5" /><circle cx="4.5" cy="10" r="0.75" fill="currentColor" stroke="none" /><circle cx="15.5" cy="10" r="0.75" fill="currentColor" stroke="none" />
  </svg>
);
const IcOilDrop = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <path d="M10 2C7.5 6 5 8.5 5 11.5a5 5 0 0 0 10 0C15 8.5 12.5 6 10 2z" />
  </svg>
);
const IcTax = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <rect x="3" y="2" width="14" height="16" rx="1.5" />
    <line x1="7" y1="7" x2="13" y2="7" /><line x1="7" y1="10" x2="13" y2="10" /><line x1="7" y1="13" x2="10" y2="13" />
  </svg>
);
const IcDiscount = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <line x1="15" y1="5" x2="5" y2="15" />
    <circle cx="6.5" cy="6.5" r="1.5" /><circle cx="13.5" cy="13.5" r="1.5" />
  </svg>
);
const IcDecline = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} width={13} height={13}>
    <polyline points="2 6 7 11 11 8 18 14" />
    <polyline points="14 14 18 14 18 10" />
  </svg>
);

/* ── Helpers ────────────────────────────────────────────── */
const C = {
  bg:      "#0f1117",
  surface: "#161b27",
  card:    "#1c2333",
  sidebar: "#141926",
  border:  "#252e42",
  bsoft:   "#1e2840",
  txt:     "#e8eaf0",
  txt2:    "#8892a4",
  muted:   "#4a5568",
  accent:  "#4f8ef7",
  adim:    "rgba(79,142,247,0.1)",
  aborder: "rgba(79,142,247,0.25)",
  pos:     "#4ade80",
  neg:     "#f87171",
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "20px", ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ color: C.txt, fontSize: "13px", fontWeight: 600, marginBottom: "16px", letterSpacing: "0.2px" }}>
      {children}
    </h3>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function MigasDashboard() {
  const [params, setParams]       = useState<ProjectParams>(DEFAULT_PARAMS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"charts" | "table">("charts");
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const result = useCallback(() => {
    if (params.projectDuration < 7) return null;
    return calculate(params);
  }, [params])();

  const setParam = <K extends keyof ProjectParams>(key: K, value: ProjectParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const setProdYear = (idx: number, val: number) => {
    const arr = [...params.productionYears];
    arr[idx] = val;
    setParam("productionYears", arr);
  };

  const handleExportCSV = () => {
    if (!result) return;
    const csv = exportToCSV(result.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analisis_ekonomi_migas.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const durationError = params.projectDuration < 7;
  const indicators = result?.indicators;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", backgroundColor: C.bg }}>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{
        width: sidebarOpen ? "300px" : "0px",
        minWidth: sidebarOpen ? "300px" : "0px",
        backgroundColor: C.sidebar,
        borderRight: `1px solid ${C.bsoft}`,
        overflowY: "auto", overflowX: "hidden",
        transition: "width 0.28s ease, min-width 0.28s ease",
        flexShrink: 0,
      }}>
        <div style={{ padding: "18px 16px", minWidth: "268px" }}>

          {/* Group info */}
          <div style={{
            background: "linear-gradient(135deg, #141f35 0%, #1a2a45 100%)",
            borderRadius: "8px", padding: "14px 16px", marginBottom: "16px",
            border: `1px solid #1e3055`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: C.adim, border: `1px solid ${C.aborder}`,
                display: "flex", alignItems: "center", justifyContent: "center", color: C.accent,
              }}>
                <IcDroplet />
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: C.txt }}>Kelompok 6</div>
                <div style={{ fontSize: "11px", color: C.txt2 }}>Aplikasi Perminyakan</div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid #1e3055`, paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { name: "R. Revano Athalla Kartika", nim: "123230150", role: "Ketua" },
                { name: "Narindera Jati Panuntun",   nim: "123230153", role: "Anggota" },
              ].map((m) => (
                <div key={m.nim} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#c8d8f0" }}>{m.name}</div>
                    <div style={{ fontSize: "10px", color: C.txt2 }}>{m.nim} · {m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manajemen Proyek */}
          <SectionHeader title="Manajemen Proyek" icon={
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} width={12} height={12}>
              <path d="M1 3a1 1 0 0 1 1-1h3l1 1.5H12a1 1 0 0 1 1 1V11a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3z" />
            </svg>
          } />
          <ProjectManager currentParams={params} onLoad={(loaded) => setParams(loaded)} />
          <div style={{ height: "6px" }} />

          {/* Parameter Proyek */}
          <SectionHeader title="Parameter Proyek" icon={<IcSettings />} />
          <NumberInput label="Jangka Waktu Proyek" value={params.projectDuration}
            onChange={(v) => setParam("projectDuration", Math.max(1, Math.round(v)))}
            min={1} max={100} step={1} unit="tahun" />
          {durationError && (
            <div style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "6px", padding: "8px 10px", fontSize: "11px", color: "#f87171",
              marginBottom: "10px", display: "flex", gap: "7px", alignItems: "flex-start",
            }}>
              <IcAlert />
              <span>Minimal 7 tahun diperlukan untuk data produksi</span>
            </div>
          )}

          {/* Investasi */}
          <SectionHeader title="Investasi" icon={<IcMoney />} />
          <NumberInput label="Investasi Capital" value={params.capitalInvestment}
            onChange={(v) => setParam("capitalInvestment", v)} step={100} unit="$M" />
          <NumberInput label="Investasi Non-Capital" value={params.nonCapitalInvestment}
            onChange={(v) => setParam("nonCapitalInvestment", v)} step={100} unit="$M" />
          <div style={{
            background: C.adim, border: `1px solid ${C.aborder}`,
            borderRadius: "6px", padding: "7px 10px", marginBottom: "10px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: "11px", color: C.txt2 }}>Total Investasi</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: C.accent }}>
              ${(params.capitalInvestment + params.nonCapitalInvestment).toLocaleString()}M
            </span>
          </div>

          {/* Produksi */}
          <SectionHeader title="Data Produksi Tahun 1–7" icon={<IcOilDrop />} />
          {params.productionYears.map((val, i) => (
            <NumberInput key={i} label={`Tahun ${i + 1}`} value={val}
              onChange={(v) => setProdYear(i, v)} step={0.1} unit="Mbbl" />
          ))}

          {/* Teknis */}
          <SectionHeader title="Parameter Teknis" icon={<IcDecline />} />
          <SliderInput label="Laju Penurunan Produksi" value={params.declineRate}
            onChange={(v) => setParam("declineRate", v)} min={0} max={50} step={0.1} />
          <NumberInput label="Harga Minyak Rata-rata" value={params.oilPrice}
            onChange={(v) => setParam("oilPrice", v)} step={0.5} unit="$/bbl" />
          <NumberInput label="Biaya Operasional (Opex)" value={params.opexPerYear}
            onChange={(v) => setParam("opexPerYear", v)} step={10} unit="$M/thn" />

          {/* Akuntansi */}
          <SectionHeader title="Akuntansi &amp; Pajak" icon={<IcTax />} />
          <SelectInput label="Metode Depresiasi" value={params.depreciationMethod}
            options={["Straight Line", "Declining Balance", "Unit of Production"]}
            onChange={(v) => setParam("depreciationMethod", v as ProjectParams["depreciationMethod"])} />
          <SliderInput label="Tarif Pajak Pendapatan" value={params.taxRate}
            onChange={(v) => setParam("taxRate", v)} min={0} max={100} step={0.5} />

          {/* Diskonto */}
          <SectionHeader title="Diskonto" icon={<IcDiscount />} />
          <SliderInput label="Tingkat Diskonto (NPV)" value={params.discountRate}
            onChange={(v) => setParam("discountRate", v)} min={0} max={50} step={0.5} />

          {/* Reset */}
          <button onClick={() => setParams(DEFAULT_PARAMS)} style={{
            width: "100%", padding: "9px", marginTop: "6px",
            background: "rgba(255,255,255,0.03)", color: C.muted,
            border: `1px solid ${C.bsoft}`, borderRadius: "6px",
            fontSize: "12px", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "6px",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}
          >
            <IcRefresh /> Reset ke Default
          </button>
          <div style={{ height: "16px" }} />
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{
          padding: "0 22px", height: "58px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${C.bsoft}`, backgroundColor: C.surface,
          flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setSidebarOpen((s) => !s)} title="Buka/Tutup Panel" style={{
              background: "rgba(255,255,255,0.04)", color: C.txt2,
              border: `1px solid ${C.border}`, borderRadius: "6px", padding: "6px 8px",
              display: "flex", alignItems: "center",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              <IcMenu />
            </button>
            <div>
              <h1 style={{ fontSize: "16px", fontWeight: 700, color: C.txt, lineHeight: 1.2 }}>
                Sistem Analisis Ekonomi Lapangan Migas
              </h1>
              <p style={{ fontSize: "11px", color: C.muted, marginTop: "1px" }}>
                Perhitungan Aliran Kas &amp; Indikator Keekonomian
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "11px", color: C.pos,
              background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: "20px", padding: "3px 10px", fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.pos, display: "inline-block" }} />
              Live
            </div>
            {result && (
              <button onClick={handleExportCSV} style={{
                background: C.adim, color: C.accent, border: `1px solid ${C.aborder}`,
                borderRadius: "6px", padding: "6px 13px", fontSize: "12px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.18)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.adim; }}
              >
                <IcDownload /> Ekspor CSV
              </button>
            )}
          </div>
        </header>

        {/* Body */}
        <div style={{ padding: "22px", flex: 1 }}>

          {/* Error */}
          {durationError && (
            <div style={{
              background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: "10px", padding: "18px 22px", textAlign: "center",
              color: "#f87171", marginBottom: "20px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
            }}>
              <IcAlert />
              <div style={{ fontSize: "15px", fontWeight: 600 }}>Jangka waktu proyek harus minimal 7 tahun</div>
              <div style={{ fontSize: "12px", color: C.txt2 }}>Input data produksi membutuhkan data dari Tahun 1 sampai Tahun 7</div>
            </div>
          )}

          {mounted && result && indicators && (
            <>
              {/* KPI Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
                <KpiCard title="Net Present Value (NPV)" value={formatCurrency(indicators.npv)}
                  subtitle={`Diskonto ${params.discountRate}%`} icon={<IcTrend />} delay={0} positive={indicators.npv > 0} />
                <KpiCard title="Pay Out Time (POT)"
                  value={indicators.pot !== null ? `${indicators.pot} Tahun` : "N/A"}
                  subtitle={indicators.pot !== null ? "Modal investasi kembali" : "Investasi belum kembali"}
                  icon={<IcClock />} delay={80} positive={indicators.pot !== null} />
                <KpiCard title="Rate of Return (ROR)" value={`${indicators.ror.toFixed(2)}%`}
                  subtitle="Rasio pengembalian modal" icon={<IcPercent />} delay={160} positive={indicators.ror > 0} />
                <KpiCard title="Total Aliran Kas Bersih" value={formatCurrency(indicators.totalNcf)}
                  subtitle={`Durasi ${params.projectDuration} tahun`} icon={<IcWallet />} delay={240} positive={indicators.totalNcf > 0} />
              </div>

              {/* Tabs */}
              <div style={{ borderBottom: `1px solid ${C.bsoft}`, marginBottom: "20px", display: "flex", gap: "2px" }}>
                {([["charts", "Analisis Grafik", <IcBarChart key="bc" />], ["table", "Tabel Detail", <IcTable key="tb" />]] as const).map(([tab, label, icon]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    background: "none", border: "none",
                    borderBottom: activeTab === tab ? `2px solid ${C.accent}` : "2px solid transparent",
                    color: activeTab === tab ? C.txt : C.muted,
                    padding: "8px 14px", fontSize: "13px",
                    fontWeight: activeTab === tab ? 600 : 400,
                    borderRadius: 0, cursor: "pointer", transition: "all 0.15s",
                    marginBottom: "-1px", display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* ── CHARTS TAB ── */}
              {activeTab === "charts" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <Card>
                      <CardTitle>Profil Produksi Minyak Bumi</CardTitle>
                      <ProductionChart rows={result.rows} />
                    </Card>
                    <Card>
                      <CardTitle>Tren Aliran Kas Tahunan</CardTitle>
                      <CashFlowTrendChart rows={result.rows} />
                    </Card>
                  </div>

                  <Card style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ color: C.txt, fontSize: "13px", fontWeight: 600 }}>
                        Aliran Kas Bersih Kumulatif — Analisis Periode Pengembalian Modal
                      </h3>
                      <div style={{ display: "flex", gap: "14px", fontSize: "11px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", color: C.txt2 }}>
                          <span style={{ width: 10, height: 3, background: "#f87171", borderRadius: 2, display: "inline-block" }} />
                          Belum balik modal
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", color: C.txt2 }}>
                          <span style={{ width: 10, height: 3, background: "#4ade80", borderRadius: 2, display: "inline-block" }} />
                          Sudah untung
                        </span>
                      </div>
                    </div>
                    <CumulativeBarChart rows={result.rows} />
                  </Card>

                  {/* Parameter summary */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                    {[
                      { label: "Total Investasi",      value: `$${(params.capitalInvestment + params.nonCapitalInvestment).toLocaleString()}M` },
                      { label: "Harga Minyak",         value: `$${params.oilPrice}/bbl` },
                      { label: "Metode Depresiasi",    value: params.depreciationMethod === "Straight Line" ? "Garis Lurus" : params.depreciationMethod === "Declining Balance" ? "Saldo Menurun" : "Satuan Produksi" },
                      { label: "Tarif Pajak",          value: `${params.taxRate}%` },
                      { label: "Laju Penurunan Prod.", value: `${params.declineRate}%/tahun` },
                      { label: "Biaya Operasional",    value: `$${params.opexPerYear}M/tahun` },
                    ].map((item) => (
                      <div key={item.label} style={{
                        backgroundColor: C.card, border: `1px solid ${C.border}`,
                        borderRadius: "8px", padding: "12px 14px",
                        transition: "border-color 0.15s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                      >
                        <div style={{ fontSize: "10px", color: C.muted, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: C.txt }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TABLE TAB ── */}
              {activeTab === "table" && (
                <div>
                  <Card style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ color: C.txt, fontSize: "13px", fontWeight: 600 }}>
                        Tabel Perhitungan Detail Aliran Kas
                      </h3>
                      <button onClick={handleExportCSV} style={{
                        background: "rgba(74,222,128,0.08)", color: C.pos,
                        border: "1px solid rgba(74,222,128,0.22)",
                        borderRadius: "6px", padding: "6px 13px", fontSize: "12px", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.15)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,222,128,0.08)"; }}
                      >
                        <IcDownload /> Unduh CSV
                      </button>
                    </div>
                    <DataTable rows={result.rows} />
                  </Card>

                  {/* Rumus */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "10px" }}>
                    {[
                      { title: "Pendapatan Kena Pajak", formula: "Pendapatan − Opex − Depresiasi" },
                      { title: "Aliran Kas Bersih (NCF)", formula: "Pend. Kena Pajak − Pajak" },
                      { title: "Nilai Sekarang Bersih (NPV)", formula: "Σ [ NCF_t / (1 + r)^t ]" },
                      { title: "Tingkat Pengembalian (ROR)", formula: "(Total NCF / Total Investasi) × 100%" },
                    ].map((f) => (
                      <div key={f.title} style={{
                        backgroundColor: C.card,
                        border: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${C.accent}`,
                        borderRadius: "8px", padding: "12px 14px",
                      }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: C.txt2, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>
                          {f.title}
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "13px", color: C.txt }}>
                          {f.formula}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!mounted && (
            <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>
              Memuat dashboard...
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          padding: "10px 22px", borderTop: `1px solid ${C.bsoft}`,
          textAlign: "center", fontSize: "11px", color: C.muted, flexShrink: 0,
        }}>
          Sistem Analisis Ekonomi Lapangan Migas · Kelompok 6 · R. Revano Athalla Kartika (123230150) &amp; Narindera Jati Panuntun (123230153) · Informatika UPN &quot;Veteran&quot; Yogyakarta 2026
        </footer>
      </main>
    </div>
  );
}

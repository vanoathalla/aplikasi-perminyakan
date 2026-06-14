"use client";

import { CashFlowRow } from "@/lib/calculations";

interface DataTableProps {
  rows: CashFlowRow[];
}

function fmt(v: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function ValCell({ v, highlight = false }: { v: number; highlight?: boolean }) {
  const color = highlight
    ? v < 0 ? "#f87171" : v > 0 ? "#4ade80" : "#8892a4"
    : "#c8d0dc";

  return (
    <td style={{
      padding: "9px 12px", textAlign: "right", color,
      fontVariantNumeric: "tabular-nums", fontSize: "13px",
      borderBottom: "1px solid rgba(37,46,66,0.8)", whiteSpace: "nowrap",
    }}>
      {v < 0 ? `(${fmt(Math.abs(v))})` : fmt(v)}
    </td>
  );
}

export default function DataTable({ rows }: DataTableProps) {
  // Compute totals
  const totals = {
    production: rows.reduce((a, r) => a + r.production, 0),
    income: rows.reduce((a, r) => a + r.income, 0),
    capital: rows.reduce((a, r) => a + r.capital, 0),
    nonCapital: rows.reduce((a, r) => a + r.nonCapital, 0),
    opex: rows.reduce((a, r) => a + r.opex, 0),
    depreciation: rows.reduce((a, r) => a + r.depreciation, 0),
    taxableIncome: rows.reduce((a, r) => a + r.taxableIncome, 0),
    tax: rows.reduce((a, r) => a + r.tax, 0),
    ncf: rows.reduce((a, r) => a + r.ncfUndiscounted, 0),
    cumNcf: rows[rows.length - 1]?.cumulativeNcf ?? 0,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#0f1117",
    color: "#8892a4",
    padding: "10px 12px",
    textAlign: "right",
    fontWeight: 600,
    fontSize: "10px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: "1px solid #252e42",
    position: "sticky",
    top: 0,
    zIndex: 2,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "480px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: "center", minWidth: "55px" }}>Tahun</th>
            <th style={{ ...headerStyle, minWidth: "110px" }}>Produksi (Mbbl)</th>
            <th style={{ ...headerStyle, minWidth: "110px" }}>Pendapatan ($M)</th>
            <th style={{ ...headerStyle, minWidth: "110px" }}>Inv. Kapital ($M)</th>
            <th style={{ ...headerStyle, minWidth: "130px" }}>Inv. Non-Kapital ($M)</th>
            <th style={{ ...headerStyle, minWidth: "100px" }}>Opex ($M)</th>
            <th style={{ ...headerStyle, minWidth: "120px" }}>Depresiasi ($M)</th>
            <th style={{ ...headerStyle, minWidth: "150px" }}>Pend. Kena Pajak ($M)</th>
            <th style={{ ...headerStyle, minWidth: "100px" }}>Pajak ($M)</th>
            <th style={{ ...headerStyle, minWidth: "140px" }}>Aliran Kas Bersih ($M)</th>
            <th style={{ ...headerStyle, minWidth: "150px" }}>Kum. Aliran Kas ($M)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isYear0 = row.year === 0;
            const rowBg = isYear0 ? "rgba(248,113,113,0.04)" : "transparent";
            return (
              <tr key={row.year} style={{ backgroundColor: rowBg }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "rgba(255,255,255,0.025)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = rowBg; }}
              >
                <td style={{
                  padding: "9px 12px", textAlign: "center", fontWeight: 700,
                  color: isYear0 ? "#f87171" : "#8892a4",
                  borderBottom: "1px solid rgba(37,46,66,0.8)", fontSize: "13px",
                }}>
                  {row.year}
                </td>
                <ValCell v={row.production} />
                <ValCell v={row.income} />
                <ValCell v={row.capital} />
                <ValCell v={row.nonCapital} />
                <ValCell v={row.opex} />
                <ValCell v={row.depreciation} />
                <ValCell v={row.taxableIncome} />
                <ValCell v={row.tax} />
                <ValCell v={row.ncfUndiscounted} highlight />
                <ValCell v={row.cumulativeNcf} highlight />
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td style={{
              padding: "10px 12px", textAlign: "center", fontWeight: 800,
              fontSize: "12px", color: "#4f8ef7",
              backgroundColor: "rgba(79,142,247,0.08)", borderTop: "2px solid rgba(79,142,247,0.4)",
              letterSpacing: "0.5px",
            }}>
              TOTAL
            </td>
            {[
              totals.production, totals.income, totals.capital, totals.nonCapital,
              totals.opex, totals.depreciation, totals.taxableIncome, totals.tax,
              totals.ncf, totals.cumNcf,
            ].map((val, i) => (
              <td key={i} style={{
                padding: "10px 12px", textAlign: "right", fontWeight: 700,
                fontSize: "13px",
                color: val < 0 ? "#f87171" : "#4ade80",
                backgroundColor: "rgba(79,142,247,0.08)",
                borderTop: "2px solid rgba(79,142,247,0.4)",
                fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
              }}>
                {val < 0 ? `(${fmt(Math.abs(val))})` : fmt(val)}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

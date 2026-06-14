"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CashFlowRow } from "@/lib/calculations";

const GRID_COLOR = "#1e2840";
const TEXT_COLOR = "#8892a4";

const CustomTooltipStyle: React.CSSProperties = {
  backgroundColor: "#1c2333",
  border: "1px solid #252e42",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "12px",
  color: "#e8eaf0",
  boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
};

// ─── Production Area Chart ────────────────────────────────
interface ProductionChartProps {
  rows: CashFlowRow[];
}

export function ProductionChart({ rows }: ProductionChartProps) {
  const data = rows
    .filter((r) => r.year > 0)
    .map((r) => ({
      year: `Thn ${r.year}`,
      produksi: parseFloat(r.production.toFixed(2)),
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis
          dataKey="year"
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v) => `${v.toFixed(0)}`}
          width={55}
        />
          {/* ── Tooltip grafik produksi ── */}
        <Tooltip
          contentStyle={CustomTooltipStyle}
          formatter={(v) => [`${Number(v).toFixed(2)} Mbbl`, "Produksi"]}
          labelStyle={{ color: "#6c9bd1", fontWeight: 600, marginBottom: 4 }}
        />
        <Area
          type="monotone"
          dataKey="produksi"
          stroke="#4f8ef7"
          strokeWidth={2}
          fill="url(#prodGradient)"
          dot={false}
          activeDot={{ r: 5, fill: "#4f8ef7", stroke: "#0f1117", strokeWidth: 2 }}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Cash Flow Trend Multi-Line Chart ─────────────────────
interface CashFlowTrendChartProps {
  rows: CashFlowRow[];
}

export function CashFlowTrendChart({ rows }: CashFlowTrendChartProps) {
  const data = rows
    .filter((r) => r.year > 0)
    .map((r) => ({
      year: `Thn ${r.year}`,
      income: parseFloat(r.income.toFixed(2)),
      opex: parseFloat(r.opex.toFixed(2)),
      ncf: parseFloat(r.ncfUndiscounted.toFixed(2)),
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis
          dataKey="year"
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={65}
        />
        <Tooltip
          contentStyle={CustomTooltipStyle}
          formatter={(v, name) => {
            const labels: Record<string, string> = {
              income: "Pendapatan",
              opex: "Biaya Operasional",
              ncf: "Aliran Kas Bersih",
            };
            return [`$${Number(v).toFixed(2)}M`, labels[String(name)] ?? String(name)];
          }}
          labelStyle={{ color: "#e8c468", fontWeight: 600, marginBottom: 4 }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          formatter={(v) => {
            const labels: Record<string, string> = {
              income: "Pendapatan",
              opex: "Biaya Operasional",
              ncf: "Aliran Kas Bersih",
            };
            return <span style={{ color: TEXT_COLOR }}>{labels[v] ?? v}</span>;
          }}
        />
        <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2}
          dot={false} activeDot={{ r: 5, fill: "#4ade80", stroke: "#0f1117", strokeWidth: 2 }}
          animationDuration={1000} animationEasing="ease-out" />
        <Line type="monotone" dataKey="opex" stroke="#f87171" strokeWidth={2}
          dot={false} activeDot={{ r: 5, fill: "#f87171", stroke: "#0f1117", strokeWidth: 2 }}
          animationDuration={1000} animationEasing="ease-out" animationBegin={150} />
        <Line type="monotone" dataKey="ncf" stroke="#4f8ef7" strokeWidth={2}
          dot={false} activeDot={{ r: 5, fill: "#4f8ef7", stroke: "#0f1117", strokeWidth: 2 }}
          animationDuration={1000} animationEasing="ease-out" animationBegin={300} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Cumulative NCF Bar Chart (Payback analysis) ──────────
interface CumulativeBarChartProps {
  rows: CashFlowRow[];
}

export function CumulativeBarChart({ rows }: CumulativeBarChartProps) {
  const data = rows.map((r) => ({
    year: r.year === 0 ? "Thn 0" : `Thn ${r.year}`,
    cumNcf: parseFloat(r.cumulativeNcf.toFixed(2)),
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis
          dataKey="year"
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke={TEXT_COLOR}
          tick={{ fill: TEXT_COLOR, fontSize: 11 }}
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={70}
        />
        <Tooltip
          contentStyle={CustomTooltipStyle}
          formatter={(v) => [`$${Number(v).toFixed(2)}M`, "Aliran Kas Kumulatif"]}
          labelStyle={{ color: "#b0b0b0", fontWeight: 600, marginBottom: 4 }}
        />
        <ReferenceLine y={0} stroke="#334155" strokeDasharray="5 3" strokeWidth={1.5} />
        <Bar dataKey="cumNcf" radius={[3, 3, 0, 0]} animationDuration={1000} animationEasing="ease-out">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cumNcf < 0 ? "#f87171" : "#4ade80"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

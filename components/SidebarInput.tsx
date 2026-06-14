"use client";

/* ── Number Input ─────────────────────────────────────── */
interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberInput({ label, value, onChange, min = 0, max, step = 1, unit }: NumberInputProps) {
  return (
    <div className="input-group">
      <label className="input-label">
        {label}
        {unit && <span style={{ color: "#4f8ef7", marginLeft: 4, fontWeight: 400 }}>{unit}</span>}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

/* ── Slider Input ─────────────────────────────────────── */
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function SliderInput({ label, value, onChange, min = 0, max = 100, step = 0.5, unit = "%" }: SliderInputProps) {
  return (
    <div className="input-group">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label className="input-label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{
          fontSize: "12px", fontWeight: 700, color: "#4f8ef7",
          background: "rgba(79,142,247,0.1)", padding: "1px 7px",
          borderRadius: "4px", border: "1px solid rgba(79,142,247,0.2)",
        }}>
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span style={{ fontSize: 10, color: "#4a5568" }}>{min}{unit}</span>
        <span style={{ fontSize: 10, color: "#4a5568" }}>{max}{unit}</span>
      </div>
    </div>
  );
}

/* ── Select Input ─────────────────────────────────────── */
interface SelectInputProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export function SelectInput({ label, value, options, onChange }: SelectInputProps) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

/* ── Section Header ───────────────────────────────────── */
interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "7px",
      marginBottom: "10px", marginTop: "6px",
      paddingBottom: "8px", borderBottom: "1px solid #1e2840",
    }}>
      {icon && <span style={{ color: "#4f8ef7", display: "flex", alignItems: "center" }}>{icon}</span>}
      <span style={{
        fontSize: "10px", fontWeight: 700, color: "#4a5568",
        textTransform: "uppercase", letterSpacing: "1px",
      }}>
        {title}
      </span>
    </div>
  );
}

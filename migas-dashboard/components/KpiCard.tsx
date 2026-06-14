"use client";

import { useEffect, useState } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  delay?: number;
  positive?: boolean | null;
}

export default function KpiCard({ title, value, subtitle, icon, delay = 0, positive }: KpiCardProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const valueColor =
    positive === true  ? "#4ade80" :
    positive === false ? "#f87171" : "#e8eaf0";

  return (
    <div
      style={{
        backgroundColor: "#1c2333",
        border: "1px solid #252e42",
        borderRadius: "10px",
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s, border-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.4)";
        el.style.borderColor = "#334155";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "none";
        el.style.borderColor = "#252e42";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Subtle left accent line */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: "3px", background: "#4f8ef7",
        borderRadius: "10px 0 0 10px",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: "8px" }}>
        <div style={{ flex: 1 }}>
          <p style={{
            color: "#8892a4", fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: "8px",
          }}>
            {title}
          </p>
          <p style={{
            color: valueColor, fontSize: "24px", fontWeight: 700,
            lineHeight: 1.1, letterSpacing: "-0.5px",
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ color: "#4a5568", fontSize: "11px", marginTop: "5px" }}>{subtitle}</p>
          )}
        </div>
        <div style={{
          width: "38px", height: "38px", borderRadius: "8px",
          background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#4f8ef7", flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

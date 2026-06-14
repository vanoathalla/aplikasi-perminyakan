import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Analisis Ekonomi Lapangan Migas",
  description:
    "Dashboard analisis keekonomian lapangan migas — perhitungan aliran kas, NPV, POT, ROR secara interaktif",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#1a1a1a" }}>
        {children}
      </body>
    </html>
  );
}

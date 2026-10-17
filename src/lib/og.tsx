import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function renderOg({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          borderTop: "14px solid #2563eb",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#1a1a1a", fontWeight: 700 }}>
          Kira<span style={{ color: "#2563eb" }}>Prep.com</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: 26,
              color: "#2563eb",
              background: "#eff6ff",
              border: "2px solid #dbeafe",
              borderRadius: 999,
              padding: "8px 24px",
              marginBottom: 28,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "#0f172a", lineHeight: 1.08, letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#64748b", marginTop: 24 }}>
            {subtitle}
          </div>
        </div>
      </div>
    ),
    ogSize
  );
}

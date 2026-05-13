import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "dronelingo — EASA A1/A3 drone exam prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: "96px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-3px",
            lineHeight: 1,
            marginBottom: "20px",
          }}
        >
          dronelingo
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "40px",
            color: "#94a3b8",
            fontWeight: 500,
            marginBottom: "36px",
            lineHeight: 1.2,
          }}
        >
          EASA A1/A3 drone exam prep
        </div>

        {/* Value prop */}
        <div
          style={{
            fontSize: "28px",
            color: "#64748b",
            fontWeight: 400,
          }}
        >
          Free to learn · €19 only after you pass
        </div>

        {/* Bottom-left: badge */}
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            padding: "10px 22px",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "20px", color: "#60a5fa" }}>
            Latvia · EU EASA compliant
          </div>
        </div>

        {/* Bottom-right: domain + langs */}
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            right: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "26px", color: "#94a3b8", fontWeight: 600 }}>
            dronelingo.eu
          </div>
          <div style={{ fontSize: "18px", color: "#475569" }}>lv · en · ru</div>
        </div>
      </div>
    ),
    { ...size },
  );
}

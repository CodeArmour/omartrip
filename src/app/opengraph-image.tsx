import { ImageResponse } from "next/og";

export const alt = "Omar Abusahmoud software developer portfolio preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: "#2f3a1d",
        color: "#f8f7f0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 76% 30%, rgba(207,255,116,0.28), transparent 34%), radial-gradient(circle at 16% 84%, rgba(232,222,255,0.16), transparent 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(207,255,116,0.14) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#cfff74",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Omar Abusahmoud</span>
          <span>Brussels, Belgium</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 28,
              border: "1px solid rgba(207,255,116,0.36)",
              background: "rgba(11,15,7,0.56)",
              color: "#cfff74",
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.08em",
            }}
          >
            OA
          </div>
          <h1
            style={{
              maxWidth: 820,
              margin: 0,
              fontSize: 78,
              lineHeight: 0.96,
              letterSpacing: "-0.07em",
            }}
          >
            Software Developer for web, mobile, cloud and AI products.
          </h1>
          <p
            style={{
              maxWidth: 780,
              margin: 0,
              color: "rgba(248,247,240,0.78)",
              fontSize: 30,
              lineHeight: 1.35,
            }}
          >
            Premium personal portfolio, selected projects, articles and ways to
            work with Omar.
          </p>
        </div>
      </div>
    </div>,
    size,
  );
}

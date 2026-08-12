import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "18px",
        background: "#2f3a1d",
        color: "#cfff74",
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: "-0.08em",
      }}
    >
      OA
    </div>,
    size,
  );
}

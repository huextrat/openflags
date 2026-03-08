import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

// Image generation
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "#09090b",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Toggle Container */}
      <div
        style={{
          width: "68%",
          height: "37.5%",
          borderRadius: 48,
          overflow: "hidden",
          display: "flex",
          position: "relative",
        }}
      >
        {/* Gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background: "linear-gradient(to bottom right, #8b5cf6, #06b6d4)",
          }}
        />
        {/* Knob */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "#ffffff",
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    }
  )
}

import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "OpenFlags - Open Source Feature Flags"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#050505",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow orb (Violet) top-left */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(5, 5, 5, 0) 60%)",
          borderRadius: "50%",
        }}
      />

      {/* Background glow orb (Cyan) bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-300px",
          right: "-200px",
          width: "1000px",
          height: "1000px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(5, 5, 5, 0) 65%)",
          borderRadius: "50%",
        }}
      />

      {/* Main Header with Logo & Brand Name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "48px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "20px 48px",
          borderRadius: "100px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background:
              "linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            marginRight: "24px",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
          }}
        >
          <svg viewBox="0 0 32 32" width="32" height="32" fill="white">
            <path d="M9 5.5a1.5 1.5 0 0 1 3 0v1.2h9.2c1.47 0 2.38 1.6 1.64 2.87l-2.7 4.63 2.7 4.63c.74 1.28-.17 2.87-1.64 2.87H12V26.5a1.5 1.5 0 0 1-3 0V5.5Z" />
          </svg>
        </div>
        <p
          style={{
            fontSize: "36px",
            fontWeight: "900",
            margin: 0,
            letterSpacing: "0.24em",
            color: "white",
            textTransform: "uppercase",
          }}
        >
          OpenFlags
        </p>
      </div>

      {/* Headlines */}
      <h2
        style={{
          fontSize: "76px",
          fontWeight: "700",
          textAlign: "center",
          lineHeight: "1.1",
          margin: "0 0 32px 0",
          color: "white",
          maxWidth: "960px",
          letterSpacing: "-0.04em",
          textShadow: "0 0 40px rgba(255, 255, 255, 0.1)",
        }}
      >
        Feature flags that feel lightweight.
      </h2>

      <p
        style={{
          fontSize: "34px",
          fontWeight: "500",
          color: "rgba(255, 255, 255, 0.6)",
          margin: "0",
          textAlign: "center",
          maxWidth: "850px",
          lineHeight: "1.4",
          letterSpacing: "-0.01em",
        }}
      >
        A release stack built for modern apps. Ship safer and keep ownership in your own
        infrastructure.
      </p>

      {/* Feature Pills */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          marginTop: "64px",
        }}
      >
        {["0ms local latency", "Fully open source", "Self-hosted control"].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "16px 32px",
              borderRadius: "100px",
              fontSize: "24px",
              fontWeight: "600",
              color: "rgba(255, 255, 255, 0.9)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  )
}

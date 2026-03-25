"use client";

import { forwardRef } from "react";

interface PhotoFrameProps {
  name: string;
  handle: string;
  role: string;
  title: string;
  community: string;
  photoSrc: string;
  scale?: number;
}

const FRAME_W = 1080;
const FRAME_H = 1920;

const PhotoFrame = forwardRef<HTMLDivElement, PhotoFrameProps>(
  function PhotoFrame({ handle, role, title, community, photoSrc, scale }, ref) {
    return (
      <div
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: scale ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
        }}
      >
        <div
          ref={ref}
          style={{
            width: FRAME_W,
            height: FRAME_H,
            background:
              "linear-gradient(165deg, #1a0a2e 0%, #0d1117 35%, #0a1a10 65%, #0d1117 100%)",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {/* Background glow effects */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: -100,
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(123,45,142,0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -100,
              right: -100,
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(94,241,140,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Main heading */}
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>

          {/* Role */}
          {role && (
            <div
              style={{
                marginTop: 14,
                fontSize: 36,
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {role}
            </div>
          )}

          {/* Community */}
          {community && (
            <div
              style={{
                marginTop: role ? 8 : 14,
                fontSize: 30,
                fontWeight: 600,
                color: "#9b4dca",
                textAlign: "center",
                letterSpacing: "0.5px",
              }}
            >
              {community}
            </div>
          )}

          {/* Handle */}
          <div
            style={{
              marginTop: 16,
              fontSize: 42,
              color: "#5ef18c",
              fontWeight: 600,
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            {handle}
          </div>

          {/* Photo container */}
          <div
            style={{
              marginTop: 50,
              width: 680,
              height: 680,
              borderRadius: 24,
              overflow: "hidden",
              border: "4px solid rgba(255,255,255,0.15)",
              boxShadow:
                "0 0 60px rgba(94,241,140,0.2), 0 0 120px rgba(123,45,142,0.15)",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt="Tu foto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Bottom text */}
          <div
            style={{
              marginTop: 50,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
                letterSpacing: "1px",
              }}
            >
              NOS VEMOS EN LA
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "2px",
                background:
                  "linear-gradient(90deg, #5ef18c 0%, #9b4dca 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              VENDIMIATECH
            </div>
          </div>

          {/* Logo — pinned to bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 70,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/LogoVT_bg oscuro.png"
              alt="VendimiaTech"
              style={{
                height: 80,
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

export default PhotoFrame;

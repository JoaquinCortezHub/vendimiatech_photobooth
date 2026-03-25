"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import PhotoFrame from "./PhotoFrame";

interface StepPreviewProps {
  name: string;
  handle: string;
  role: string;
  title: string;
  community: string;
  photoSrc: string;
  onReset: () => void;
}

export default function StepPreview({
  name,
  handle,
  role,
  title,
  community,
  photoSrc,
  onReset,
}: StepPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth - 32; // padding
      const s = Math.min(containerWidth / 1080, 0.45);
      setScale(s);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!frameRef.current) return null;
    setGenerating(true);

    try {
      // Safari workaround: first call warms up, second generates correctly
      await toPng(frameRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });

      const dataUrl = await toPng(frameRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });

      const res = await fetch(dataUrl);
      return await res.blob();
    } catch (err) {
      console.error("Image generation failed:", err);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  async function handleShare() {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], "vendimiatech.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "VendimiaTech" });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to download
        if ((err as DOMException).name === "AbortError") return;
      }
    }

    // Fallback: download
    downloadBlob(blob);
  }

  async function handleDownload() {
    const blob = await generateImage();
    if (!blob) return;
    downloadBlob(blob);
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendimiatech.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5 w-full items-center">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-white mb-2">Tu imagen</h1>
        <p className="text-zinc-400 text-base">
          Compartila en tus redes
        </p>
      </div>

      {/* Preview container */}
      <div
        ref={containerRef}
        className="w-full flex justify-center overflow-hidden"
        style={{ height: 1920 * scale + 16 }}
      >
        <PhotoFrame
          ref={frameRef}
          name={name}
          handle={handle}
          role={role}
          title={title}
          community={community}
          photoSrc={photoSrc}
          scale={scale}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={handleShare}
          disabled={generating}
          className="w-full h-14 rounded-xl bg-brand-green text-zinc-900 font-bold text-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {generating ? (
            <span className="inline-block w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
              />
            </svg>
          )}
          {generating ? "Generando..." : "Compartir"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={generating}
          className="w-full h-14 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-base transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Descargar Imagen
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-zinc-500 underline underline-offset-2 mt-2"
      >
        Volver a empezar
      </button>
    </div>
  );
}

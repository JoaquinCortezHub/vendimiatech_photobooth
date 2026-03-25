"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface StepPhotoProps {
  onNext: (photo: string) => void;
  onBack: () => void;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function getCroppedImg(
  imageSrc: string,
  crop: Area,
  rotation: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const rotRad = (rotation * Math.PI) / 180;
      const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
        image.width,
        image.height,
        rotation
      );

      canvas.width = bBoxWidth;
      canvas.height = bBoxHeight;
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
      ctx.rotate(rotRad);
      ctx.translate(-image.width / 2, -image.height / 2);
      ctx.drawImage(image, 0, 0);

      const croppedCanvas = document.createElement("canvas");
      const croppedCtx = croppedCanvas.getContext("2d")!;

      croppedCanvas.width = crop.width;
      croppedCanvas.height = crop.height;
      croppedCtx.drawImage(
        canvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );

      resolve(croppedCanvas.toDataURL("image/jpeg", 0.92));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

function getRotatedSize(width: number, height: number, rotation: number) {
  const rotRad = (Math.abs(rotation) * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

type Mode = "pick" | "camera" | "edit";

export default function StepPhoto({ onNext, onBack }: StepPhotoProps) {
  const [mode, setMode] = useState<Mode>("pick");
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera stream on unmount or mode change
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  async function openCamera() {
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera not available — fall back to file picker
      setMode("pick");
      if (inputRef.current) {
        inputRef.current.setAttribute("capture", "user");
        inputRef.current.click();
      }
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    // Mirror the capture to match the preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    setRawImage(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setMode("edit");
  }

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    const resized = await resizeImage(file, 1500);
    setRawImage(resized);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setMode("edit");
  }, []);

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    input.removeAttribute("capture");
    input.click();
  }

  async function handleConfirmCrop() {
    if (!rawImage || !croppedAreaPixels) return;
    const cropped = await getCroppedImg(rawImage, croppedAreaPixels, rotation);
    onNext(cropped);
  }

  function handleChangePic() {
    setRawImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setMode("pick");
    if (inputRef.current) inputRef.current.value = "";
  }

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // ── Camera mode ──
  if (mode === "camera") {
    return (
      <div className="flex flex-col gap-4 w-full items-center">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white mb-2">Sacate una foto</h1>
          <p className="text-zinc-400 text-base">Mirá a la cámara</p>
        </div>
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 max-w-xs">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        <button
          type="button"
          onClick={captureFromCamera}
          className="w-16 h-16 rounded-full bg-white border-4 border-brand-green shadow-lg active:scale-90 transition-transform"
          aria-label="Capturar"
        />
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setMode("pick");
          }}
          className="text-sm text-zinc-400 underline underline-offset-2"
        >
          Cancelar
        </button>
      </div>
    );
  }

  // ── Edit mode (crop/rotate) ──
  if (mode === "edit" && rawImage) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="text-center mb-1">
          <h1 className="text-3xl font-bold text-white mb-2">Ajustá tu foto</h1>
          <p className="text-zinc-400 text-base">
            Movela, hacé zoom o rotala
          </p>
        </div>

        {/* Crop area */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900">
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={false}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-1">
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-green h-1.5"
          />
          <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
        </div>

        {/* Rotate button */}
        <button
          type="button"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="mx-auto flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Rotar 90°
        </button>

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={handleChangePic}
            className="flex-1 h-14 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-base transition-all hover:bg-zinc-800 active:scale-[0.98]"
          >
            Cambiar
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="flex-1 h-14 rounded-xl bg-brand-green text-zinc-900 font-bold text-base transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  }

  // ── Pick mode (default) ──
  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-white mb-2">Tu foto</h1>
        <p className="text-zinc-400 text-base">
          Elegí o sacate una foto para el marco
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={openCamera}
          className="w-full h-14 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-base transition-all hover:bg-zinc-700 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Tomar Foto
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="w-full h-14 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-base transition-all hover:bg-zinc-700 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
          Elegir de Galería
        </button>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full h-14 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-base transition-all hover:bg-zinc-800 active:scale-[0.98] mt-2"
      >
        Volver
      </button>
    </div>
  );
}

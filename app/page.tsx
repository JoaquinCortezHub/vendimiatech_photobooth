"use client";

import { useState } from "react";
import Image from "next/image";
import StepRegistration from "@/components/StepRegistration";
import StepPhoto from "@/components/StepPhoto";
import StepPreview from "@/components/StepPreview";

type Step = 1 | 2 | 3;

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("Hacker");
  const [community, setCommunity] = useState("");
  const [photo, setPhoto] = useState("");

  function handleRegistration(data: {
    name: string;
    handle: string;
    role: string;
    title: string;
    community: string;
  }) {
    setName(data.name);
    setHandle(data.handle);
    setRole(data.role);
    setTitle(data.title);
    setCommunity(data.community);
    setStep(2);
  }

  function handlePhoto(photoSrc: string) {
    setPhoto(photoSrc);
    setStep(3);
  }

  function handleReset() {
    setStep(1);
    setName("");
    setHandle("");
    setRole("");
    setTitle("Hacker");
    setCommunity("");
    setPhoto("");
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#0a0a0a] min-h-dvh">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex justify-center">
        <Image
          src="/assets/LogoVT_bg oscuro.png"
          alt="VendimiaTech"
          width={180}
          height={50}
          priority
          className="object-contain"
        />
      </header>

      {/* Step indicator */}
      <div className="flex gap-2 py-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step
                ? "w-8 bg-brand-green"
                : s < step
                  ? "w-8 bg-brand-green/40"
                  : "w-8 bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <main className="w-full max-w-md mx-auto px-4 pb-8 flex-1 flex flex-col justify-center"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        {step === 1 && <StepRegistration onNext={handleRegistration} />}
        {step === 2 && (
          <StepPhoto onNext={handlePhoto} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepPreview
            name={name}
            handle={handle}
            role={role}
            title={title}
            community={community}
            photoSrc={photo}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

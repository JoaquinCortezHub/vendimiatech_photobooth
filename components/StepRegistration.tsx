"use client";

import { useState } from "react";

const SPECIAL_PASSWORD = "vendimia2026";

const SPECIAL_TITLES = ["Mentor", "Speaker", "Partner", "Organizador"] as const;
type SpecialTitle = (typeof SPECIAL_TITLES)[number];

interface RegistrationData {
  name: string;
  handle: string;
  role: string;
  title: string;
  community: string;
}

interface StepRegistrationProps {
  onNext: (data: RegistrationData) => void;
}

export default function StepRegistration({ onNext }: StepRegistrationProps) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Special access state
  const [showSpecial, setShowSpecial] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [specialTitle, setSpecialTitle] = useState<SpecialTitle | null>(null);
  const [community, setCommunity] = useState("");

  const isValid = name.trim().length >= 2 && handle.trim().length >= 1;

  function handleUnlock() {
    if (password === SPECIAL_PASSWORD) {
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;

    const finalHandle = handle.startsWith("@") ? handle : `@${handle}`;
    setSubmitting(true);

    // TODO: Re-enable spreadsheet registration
    // fetch("/api/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ name: name.trim(), handle: finalHandle }),
    // }).catch(() => {});

    onNext({
      name: name.trim(),
      handle: finalHandle,
      role: role.trim(),
      title: unlocked && specialTitle ? specialTitle : "Hacker",
      community: unlocked ? community.trim() : "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-white mb-2">
          Generá tu foto
        </h1>
        <p className="text-zinc-400 text-base">
          Contanos quién sos para armar tu imagen del hackathon
        </p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-zinc-300 font-medium">Tu nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: María García"
          className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-lg p-4 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
          autoComplete="name"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-zinc-300 font-medium">
          Tu usuario / red social
        </span>
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Ej: @mariagarcia"
          className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-lg p-4 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
          autoComplete="username"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-zinc-300 font-medium">Tu rol</span>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Ej: Frontend Developer, Diseñadora, PM..."
          className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-lg p-4 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </label>

      {/* Special access section */}
      {!showSpecial && !unlocked && (
        <button
          type="button"
          onClick={() => setShowSpecial(true)}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors self-center"
        >
          Soy mentor, speaker o partner
        </button>
      )}

      {showSpecial && !unlocked && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
          <span className="text-sm text-zinc-300 font-medium">Código de acceso</span>
          <div className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Ingresá el código"
              className={`flex-1 rounded-xl bg-zinc-800/80 border text-white text-lg p-4 placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                  : "border-zinc-700 focus:ring-brand-green/50 focus:border-brand-green"
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUnlock();
                }
              }}
            />
            <button
              type="button"
              onClick={handleUnlock}
              className="px-5 rounded-xl bg-brand-violet text-white font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Verificar
            </button>
          </div>
          {passwordError && (
            <p className="text-red-400 text-sm">Código incorrecto</p>
          )}
        </div>
      )}

      {unlocked && (
        <div className="flex flex-col gap-4 p-4 rounded-xl border border-brand-violet/30 bg-brand-violet/5">
          <div className="flex items-center gap-2 text-sm text-brand-green font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Acceso especial activado
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-zinc-300 font-medium">Tu título</span>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_TITLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSpecialTitle(t)}
                  className={`h-12 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] ${
                    specialTitle === t
                      ? "bg-brand-violet text-white border-2 border-brand-violet-light"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm text-zinc-300 font-medium">
              Comunidad <span className="text-zinc-500">(opcional)</span>
            </span>
            <input
              type="text"
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              placeholder="Ej: FrontendCafé, NodeJS Argentina..."
              className="w-full rounded-xl bg-zinc-800/80 border border-zinc-700 text-white text-lg p-4 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-violet/50 focus:border-brand-violet transition-all"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting || (unlocked && !specialTitle)}
        className="w-full h-14 rounded-xl bg-brand-green text-zinc-900 font-bold text-lg mt-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        {submitting ? "Cargando..." : "Siguiente"}
      </button>
    </form>
  );
}

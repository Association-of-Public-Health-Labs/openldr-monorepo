"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
import type { DashboardId, DashboardInfo } from "../../../dashboards";
import { AuthBackdrop } from "./AuthBackdrop";
import { signInTheme, type SignInTheme } from "./sign-in-theme";

const EMBLEM_URL = "https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png";

/** Short code and subtitle shown in the portal selector. */
const PORTAL_META: Partial<Record<DashboardId, { slug: string; category: string }>> = {
  vl: { slug: "CV", category: "HIV/SIDA" },
  tb: { slug: "TB", category: "GeneXpert" },
  eid: { slug: "DPI", category: "HIV/SIDA" },
};

type Mode = "sign-in" | "reset-request" | "reset-verify";

export interface SignInScreenProps {
  /** The app this page is served from. */
  currentId: DashboardId;
  /** Portals offered in the selector, in display order. */
  portals: DashboardInfo[];
  backgroundSrc: string;
  /** Sign in; resolve once the session is active. Throw an Error with a user-facing message on failure. */
  onSignIn: (portal: DashboardInfo, email: string, password: string) => Promise<void>;
  /** Send the reset code to the email. */
  onRequestReset: (email: string) => Promise<void>;
  /** Set the new password with the emailed code and sign in. */
  onCompleteReset: (portal: DashboardInfo, code: string, password: string) => Promise<void>;
}

function themeVars(t: SignInTheme): CSSProperties {
  return {
    "--si-acc": t.accent,
    "--si-acc-fg": t.accentForeground,
    "--si-bg": t.bg,
    "--si-field": t.field,
    "--si-line": t.line,
    "--si-muted": t.muted,
    "--si-ring": t.ring,
  } as CSSProperties;
}

const fieldClass =
  "block h-12 w-full rounded-lg border border-[var(--si-line)] bg-[var(--si-field)] px-3.5 text-[15px] text-white " +
  "placeholder:text-white/35 outline-none transition-[border-color,box-shadow] duration-200 " +
  "focus:border-[var(--si-acc)] focus:shadow-[0_0_0_3px_var(--si-ring)]";

const labelClass = "mb-1.5 flex items-center justify-between text-[13px] font-semibold text-[var(--si-muted)]";

const linkClass =
  "text-[13px] font-medium text-[var(--si-acc)] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:underline";

export function SignInScreen({
  currentId,
  portals,
  backgroundSrc,
  onSignIn,
  onRequestReset,
  onCompleteReset,
}: SignInScreenProps) {
  const [selectedId, setSelectedId] = useState<DashboardId>(
    portals.some((p) => p.id === currentId) ? currentId : (portals[0]?.id ?? currentId),
  );
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const selected = portals.find((p) => p.id === selectedId) ?? portals[0]!;
  const theme = useMemo(() => signInTheme(selected), [selected]);
  const vars = themeVars(theme);
  const meta = PORTAL_META[selected.id];

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (mode === "sign-in") {
      void run(() => onSignIn(selected, email, password));
    } else if (mode === "reset-request") {
      void run(async () => {
        await onRequestReset(email);
        setMode("reset-verify");
        setInfo(`Enviámos um código para ${email.trim()}.`);
      });
    } else {
      void run(() => onCompleteReset(selected, code, newPassword));
    }
  }

  const heading =
    mode === "sign-in" ? "Entrar no" : mode === "reset-request" ? "Recuperar acesso ao" : "Nova palavra-passe para o";
  const submitLabel =
    mode === "sign-in" ? "Entrar" : mode === "reset-request" ? "Enviar código" : "Alterar e entrar";

  return (
    <AuthBackdrop backgroundSrc={backgroundSrc} tint={theme.tint}>
      <div
        style={vars}
        className="flex w-full max-w-[440px] flex-col justify-center rounded-[24px] border border-[var(--si-line)] bg-[var(--si-bg)] p-7 text-[#eef3f0] shadow-[0_24px_70px_rgba(0,0,0,0.5)] transition-[background-color,border-color] duration-500 hover:border-[var(--si-acc)] sm:min-h-[560px] sm:p-9"
      >
        <div className="mb-8 flex items-center justify-between">
          <img src={EMBLEM_URL} alt="Emblema da República de Moçambique" className="h-12 w-12" />
          <span className="rounded-full bg-[var(--si-field)] px-3 py-1 text-xs font-medium text-[var(--si-acc)] transition-colors duration-500">
            OpenLDR
          </span>
        </div>

        <h1 className="text-[28px] font-bold leading-tight">
          {heading}
          <br />
          <span className="text-[var(--si-acc)] transition-colors duration-500">{selected.portalTitle}</span>
        </h1>
        <p className="mb-7 mt-2 text-[13px] text-[var(--si-muted)]">Ministério da Saúde · República de Moçambique</p>

        <form onSubmit={handleSubmit} noValidate={false}>
          <span className={labelClass} id="si-portal-label">
            Portal
          </span>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-labelledby="si-portal-label"
              className="mb-5 flex w-full items-center gap-3 rounded-lg border border-[var(--si-line)] bg-[var(--si-field)] px-3.5 py-2.5 text-left outline-none transition-colors duration-500 focus-visible:border-[var(--si-acc)] focus-visible:shadow-[0_0_0_3px_var(--si-ring)]"
            >
              <PortalBadge portal={selected} />
              <span className="flex-1 leading-tight">
                <span className="block text-sm font-semibold">{selected.portalTitle}</span>
                {meta && <span className="block text-xs text-[var(--si-muted)]">{meta.category}</span>}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-[var(--si-muted)]" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={6}
                style={vars}
                className="z-50 w-[var(--radix-dropdown-menu-trigger-width)] rounded-xl border border-[var(--si-line)] bg-[var(--si-bg)] p-1.5 text-[#eef3f0] shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              >
                {portals.map((p) => {
                  const m = PORTAL_META[p.id];
                  return (
                    <DropdownMenu.Item
                      key={p.id}
                      disabled={!p.ready}
                      onSelect={() => setSelectedId(p.id)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--si-field)]"
                    >
                      <PortalBadge portal={p} small />
                      <span className="flex-1 leading-tight">
                        <span className="block text-sm">{p.portalTitle}</span>
                        <span className="block text-xs text-[var(--si-muted)]">
                          {p.ready ? m?.category : "Em breve"}
                        </span>
                      </span>
                      {p.id === selected.id && <Check className="h-4 w-4 text-[var(--si-acc)]" />}
                    </DropdownMenu.Item>
                  );
                })}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {info && <p className="mb-4 text-[13px] text-[var(--si-muted)]">{info}</p>}

          {mode !== "reset-verify" && (
            <div className="mb-4">
              <label htmlFor="si-email" className={labelClass}>
                Email
              </label>
              <input
                id="si-email"
                type="email"
                autoComplete="username"
                placeholder="nome@exemplo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          )}

          {mode === "sign-in" && (
            <div className="mb-5">
              <div className={labelClass}>
                <label htmlFor="si-password">Palavra-passe</label>
                <button type="button" className={linkClass} onClick={() => switchMode("reset-request")}>
                  Esqueceu?
                </button>
              </div>
              <input
                id="si-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={fieldClass}
              />
            </div>
          )}

          {mode === "reset-verify" && (
            <>
              <div className="mb-4">
                <label htmlFor="si-code" className={labelClass}>
                  Código recebido por email
                </label>
                <input
                  id="si-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
              <div className="mb-5">
                <label htmlFor="si-new-password" className={labelClass}>
                  Nova palavra-passe
                </label>
                <input
                  id="si-new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[var(--si-acc)] text-[15px] font-semibold text-[var(--si-acc-fg)] transition-[background-color,filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--si-ring)] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Spinner /> : submitLabel}
          </button>

          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-[13px] text-red-200">
              {error}
            </p>
          )}

          {mode !== "sign-in" && (
            <p className="mt-4 text-center">
              <button type="button" className={linkClass} onClick={() => switchMode("sign-in")}>
                Voltar ao início de sessão
              </button>
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-[var(--si-muted)]">
          <a href="/terms" className="hover:text-white hover:underline underline-offset-2">
            Termos de uso
          </a>
          {" · "}
          <a href="/privacy" className="hover:text-white hover:underline underline-offset-2">
            Política de protecção de dados
          </a>
        </p>
      </div>
    </AuthBackdrop>
  );
}

function PortalBadge({ portal, small }: { portal: DashboardInfo; small?: boolean }) {
  const slug = PORTAL_META[portal.id]?.slug ?? portal.id.toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-bold transition-colors duration-500 ${
        small ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-[11px]"
      }`}
      style={{ background: portal.primary, color: portal.primaryForeground }}
    >
      {slug}
    </span>
  );
}

function Spinner() {
  return (
    <span
      aria-label="A carregar"
      className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--si-acc-fg)] border-t-transparent"
    />
  );
}

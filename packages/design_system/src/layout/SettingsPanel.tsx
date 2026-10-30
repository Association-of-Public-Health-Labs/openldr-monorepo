"use client";

import type { ReactNode } from "react";
import { MoveHorizontal, X } from "lucide-react";
import type { LayoutSettings } from "./layoutSettings";
import {
  LayoutCompactIcon,
  LayoutExpandedIcon,
  LayoutStackedIcon,
  MaskIcon,
  MoonCloudyIcon,
  NavApparentIcon,
  NavIntegrateIcon,
} from "./settings-drawer-icons";

// Styles measured on the minimals.cc settings drawer (2026-10-15).
const HAIRLINE = "border-[rgba(145,158,171,0.12)]";
const TEXT = "text-[#1C252E] dark:text-white";
const MUTED = "text-[#919EAB]";
const SELECTED_TILE = `border-[rgba(145,158,171,0.08)] bg-white ${TEXT} shadow-[-8px_8px_20px_-4px_rgba(145,158,171,0.12)] dark:bg-[#1C252E]`;

/** The changes each control makes; one setting per control, everything else kept. */
export function settingsActions(settings: LayoutSettings, onChange: (next: LayoutSettings) => void) {
  return {
    toggleDark: () => onChange({ ...settings, mode: settings.mode === "dark" ? "light" : "dark" }),
    // As the old drawer: "Contraste" on = positive.
    toggleContrast: () => onChange({ ...settings, contrast: settings.contrast === "positive" ? "negative" : "positive" }),
    // "Compacto" on = content stretches to the full width (off: the 1536px container).
    toggleCompact: () => onChange({ ...settings, compact: settings.compact === "small" ? "large" : "small" }),
    setLayout: (layout: LayoutSettings["layout"]) => onChange({ ...settings, layout }),
    setColor: (color: LayoutSettings["color"]) => onChange({ ...settings, color }),
  };
}

function SwitchTrack({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-6 w-10 shrink-0 items-center rounded-full p-[5px] transition-colors ${
        on ? "bg-[#1C252E] dark:bg-white" : "bg-[rgba(145,158,171,0.48)]"
      }`}
    >
      <span
        className={`size-3.5 rounded-full shadow-sm transition-transform ${
          on ? "translate-x-4 bg-white dark:bg-[#1C252E]" : "bg-white"
        }`}
      />
    </span>
  );
}

function SettingCard({ label, icon, on, onToggle }: { label: string; icon: ReactNode; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`flex h-[100px] w-full flex-col justify-between rounded-2xl border ${HAIRLINE} pt-4 pr-4 pb-4 pl-5 text-left transition-colors ${
        on ? "bg-[rgba(145,158,171,0.08)]" : "bg-transparent hover:bg-[rgba(145,158,171,0.04)]"
      }`}
    >
      <span className="flex w-full items-start justify-between">
        <span className={TEXT}>{icon}</span>
        <SwitchTrack on={on} />
      </span>
      <span className={`text-[13px] leading-[18px] font-semibold ${TEXT}`}>{label}</span>
    </button>
  );
}

function SubLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[11px] leading-4 font-semibold text-[#637381] dark:text-[#919EAB]">{children}</p>;
}

const LAYOUTS: { value: LayoutSettings["layout"]; label: string; Icon: () => ReactNode }[] = [
  { value: "compact", label: "Compacto", Icon: LayoutCompactIcon },
  { value: "expanded", label: "Expandido", Icon: LayoutExpandedIcon },
  { value: "stacked", label: "Horizontal", Icon: LayoutStackedIcon },
];

const COLORS: { value: LayoutSettings["color"]; label: string; Icon: () => ReactNode }[] = [
  { value: "integrate", label: "Integrada", Icon: NavIntegrateIcon },
  { value: "apparent", label: "Aparente", Icon: NavApparentIcon },
];

/** Content of the settings drawer: the old drawer's settings, in the Minimals layout. */
export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: LayoutSettings;
  onChange: (next: LayoutSettings) => void;
  onClose: () => void;
}) {
  const a = settingsActions(settings, onChange);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-5">
        <h2 className={`text-lg leading-7 font-semibold ${TEXT}`}>Configurações</h2>
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="rounded-full p-2 text-[#637381] hover:bg-[rgba(145,158,171,0.08)]"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-10 overflow-y-auto px-5 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <SettingCard label="Modo Escuro" icon={<MoonCloudyIcon />} on={settings.mode === "dark"} onToggle={a.toggleDark} />
          <SettingCard label="Contraste" icon={<MaskIcon />} on={settings.contrast === "positive"} onToggle={a.toggleContrast} />
          <SettingCard
            label="Compacto"
            icon={<MoveHorizontal className="size-6" />}
            on={settings.compact === "small"}
            onToggle={a.toggleCompact}
          />
        </div>

        <section className={`relative rounded-2xl border ${HAIRLINE} px-4 pt-8 pb-4`}>
          <span className="absolute -top-[11px] left-4 h-[22px] rounded-[22px] bg-[#1C252E] px-2.5 text-[13px] leading-[22px] font-semibold text-white dark:bg-white dark:text-[#1C252E]">
            Navegação
          </span>

          <SubLabel>Layout</SubLabel>
          <div className="flex gap-3">
            {LAYOUTS.map(({ value, label, Icon }) => {
              const selected = settings.layout === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  aria-pressed={selected}
                  data-value={value}
                  onClick={() => a.setLayout(value)}
                  className={`flex h-16 w-[87px] items-center justify-center overflow-hidden rounded-xl border transition-shadow ${
                    selected ? SELECTED_TILE : `border-[rgba(145,158,171,0.08)] ${MUTED}`
                  }`}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <SubLabel>Cor</SubLabel>
            <div className="flex gap-3">
              {COLORS.map(({ value, label, Icon }) => {
                const selected = settings.color === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    data-value={value}
                    onClick={() => a.setColor(value)}
                    className={`flex h-14 flex-1 items-center justify-center gap-3 rounded-xl border text-[13px] font-semibold transition-shadow ${
                      selected ? SELECTED_TILE : `border-transparent ${MUTED}`
                    }`}
                  >
                    <Icon />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

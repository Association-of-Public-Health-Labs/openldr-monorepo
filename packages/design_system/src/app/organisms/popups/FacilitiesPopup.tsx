"use client";

import { useEffect, useState } from "react";
import type { SelectPickerOptionsProps } from "@repo/design_system_mui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import MultipleSelector, { type Option } from "../../../components/ui/multiselect";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY, DIALOG_LABEL } from "../../../lib/dialog-styles";
import { cn } from "../../../lib/utils";
import { DateRangeField } from "../../molecules/dates/DateRangeField";
import { initialRange, type IsoRange } from "../../molecules/dates/date-range";
import {
  PROVINCES,
  fetchDictionary,
  filterClinics,
  filterDistricts,
  type FacilitiesProps,
  type FacilityOption,
  type FacilityType,
} from "./facilities";

export interface FacilitiesPopupProps {
  open: boolean;
  facilities: FacilitiesProps;
  handleSubmit: (facilities: SelectPickerOptionsProps[], facilityType: FacilityType, dates: [string, string]) => void;
  initialDates?: [string, string];
  onClose?: () => void;
  defaultFacilities?: any[];
  defaultFacilityType?: FacilityType;
  isMulti?: boolean;
}

const LEVELS: { value: FacilityType; label: string }[] = [
  { value: "province", label: "Província" },
  { value: "district", label: "Distrito" },
  { value: "clinic", label: "Unidade Sanitária" },
];

/** Minimals segmented control: grey track, the chosen level on a white pill. */
function LevelPicker({ value, onChange }: { value: FacilityType; onChange: (level: FacilityType) => void }) {
  return (
    <div role="radiogroup" aria-label="Nível" className="inline-flex w-fit justify-self-start rounded-lg bg-[rgba(145,158,171,0.08)] p-1">
      {LEVELS.map((level) => (
        <button
          key={level.value}
          type="button"
          role="radio"
          aria-checked={value === level.value}
          onClick={() => onChange(level.value)}
          className={cn(
            "h-8 rounded-md px-3 text-sm font-semibold text-[#637381] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[rgba(145,158,171,0.32)] dark:text-[#919EAB]",
            value === level.value &&
              "bg-white text-[#1C252E] shadow-[0_1px_2px_0_rgba(145,158,171,0.16)] dark:bg-[#1C252E] dark:text-white",
          )}
        >
          {level.label}
        </button>
      ))}
    </div>
  );
}

type Loaded = { districts: FacilityOption[]; clinics: FacilityOption[] };

/**
 * "Editar filtros" for facility cards: level (province / district / health facility), the
 * facilities and the dates. Same props, data and result as the MUI popup it replaces: the result
 * is the last list the user changed, with the chosen level and dates.
 */
export function FacilitiesPopup({ open, handleSubmit, initialDates, onClose, defaultFacilityType, isMulti }: FacilitiesPopupProps) {
  const [level, setLevel] = useState<FacilityType>(defaultFacilityType || "province");
  const [provinces, setProvinces] = useState<FacilityOption[]>([]);
  const [districts, setDistricts] = useState<FacilityOption[]>([]);
  const [clinics, setClinics] = useState<FacilityOption[]>([]);
  const [selected, setSelected] = useState<FacilityOption[]>([]);
  const [dates, setDates] = useState<IsoRange>(() => initialRange(initialDates));
  const [loaded, setLoaded] = useState<Loaded>({ districts: [], clinics: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Districts for district and clinic levels, clinics for the clinic level; loaded once.
  useEffect(() => {
    const need: ("districts" | "clinics")[] = [];
    if (level !== "province" && loaded.districts.length === 0) need.push("districts");
    if (level === "clinic" && loaded.clinics.length === 0) need.push("clinics");
    if (need.length === 0) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all(need.map((kind) => fetchDictionary(kind).then((rows) => [kind, rows] as const)))
      .then((results) => {
        if (cancelled) return;
        setLoaded((prev) => ({ ...prev, ...Object.fromEntries(results) }));
      })
      .catch(() => !cancelled && setError("Não foi possível carregar a lista de unidades sanitárias."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [level, loaded.districts.length, loaded.clinics.length]);

  const districtOptions = filterDistricts(loaded.districts, provinces);
  const clinicOptions = filterClinics(loaded.clinics, provinces, districts);

  const pick = (options: Option[]) => options as FacilityOption[];
  const limit = isMulti ? undefined : 1;
  const placeholder = (text: string) => (loading ? "A carregar..." : text);

  const close = () => onClose?.();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Filtrar por Unidade Sanitária</DialogTitle>
          <DialogDescription>Escolha o nível, as unidades e o período do relatório.</DialogDescription>
        </DialogHeader>

        <LevelPicker value={level} onChange={setLevel} />

        <div className="grid gap-4 md:grid-cols-[7fr_5fr]">
          <div className="flex flex-col gap-4">
            <div className="*:not-first:mt-2">
              <Label className={DIALOG_LABEL}>Província</Label>
              <MultipleSelector
                value={provinces}
                defaultOptions={PROVINCES}
                maxSelected={limit}
                placeholder="Todas as Províncias"
                hidePlaceholderWhenSelected
                emptyIndicator={<p className="text-center text-sm">Nenhuma Província encontrada</p>}
                onChange={(options) => {
                  const next = pick(options);
                  setProvinces(next);
                  setDistricts([]);
                  setClinics([]);
                  setSelected(next);
                }}
              />
            </div>
            {level !== "province" && (
              <div className="*:not-first:mt-2">
                <Label className={DIALOG_LABEL}>Distrito</Label>
                <MultipleSelector
                  value={districts}
                  options={districtOptions}
                  maxSelected={limit}
                  disabled={loading}
                  placeholder={placeholder("Todos os Distritos")}
                  hidePlaceholderWhenSelected
                  emptyIndicator={<p className="text-center text-sm">Nenhum Distrito encontrado</p>}
                  onChange={(options) => {
                    const next = pick(options);
                    setDistricts(next);
                    setClinics([]);
                    setSelected(next);
                  }}
                />
              </div>
            )}
            {level === "clinic" && (
              <div className="*:not-first:mt-2">
                <Label className={DIALOG_LABEL}>Unidade Sanitária</Label>
                <MultipleSelector
                  value={clinics}
                  options={clinicOptions}
                  maxSelected={limit}
                  disabled={loading}
                  placeholder={placeholder("Todas as Unidades Sanitárias")}
                  hidePlaceholderWhenSelected
                  emptyIndicator={<p className="text-center text-sm">Nenhuma Unidade Sanitária encontrada</p>}
                  onChange={(options) => {
                    const next = pick(options);
                    setClinics(next);
                    setSelected(next);
                  }}
                />
              </div>
            )}
            {error && <p className="text-sm text-[#B71D18] dark:text-[#FFAC82]">{error}</p>}
          </div>
          <DateRangeField value={dates} onChange={setDates} />
        </div>

        <DialogFooter className="pt-2">
          <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={close}>
            Cancelar
          </button>
          <button
            type="button"
            className={DIALOG_BUTTON_PRIMARY}
            onClick={() => {
              handleSubmit(selected as SelectPickerOptionsProps[], level, dates);
              close();
            }}
          >
            Aplicar
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

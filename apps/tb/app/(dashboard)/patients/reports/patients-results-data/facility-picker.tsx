"use client";

import { useEffect, useState } from "react";
import MultipleSelector, { type Option } from "@repo/design_system/components/ui/multiselect";
import {
  PROVINCES,
  fetchDictionary,
  filterClinics,
  filterDistricts,
  type FacilityOption,
} from "@repo/design_system/app/organisms/popups/facilities";

type Dictionary = { districts: FacilityOption[]; clinics: FacilityOption[] };

// Loaded once per page visit and shared by the four search tabs.
let dictionary: Promise<Dictionary> | null = null;
const loadDictionary = () => {
  dictionary ??= Promise.all([fetchDictionary("districts"), fetchDictionary("clinics")])
    .then(([districts, clinics]) => ({ districts, clinics }))
    .catch((error) => {
      dictionary = null;
      throw error;
    });
  return dictionary;
};

const SELECTOR = "min-h-9 bg-background text-sm";

/**
 * Health facility filter of the patients search, as in the facilities dialog: an optional province
 * and district narrow the list of health facilities. `value` is the facility name the API matches.
 */
export function FacilityPicker({
  value,
  onChange,
  optional = false,
}: {
  value: string;
  onChange: (facility: string) => void;
  optional?: boolean;
}) {
  const [province, setProvince] = useState<FacilityOption[]>([]);
  const [district, setDistrict] = useState<FacilityOption[]>([]);
  const [loaded, setLoaded] = useState<Dictionary>({ districts: [], clinics: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDictionary()
      .then((d) => !cancelled && setLoaded(d))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const districtOptions = filterDistricts(loaded.districts, province);
  // By name (what the API matches), once per name.
  const clinicOptions = [
    ...new Map(filterClinics(loaded.clinics, province, district).map((c) => [c.label, { ...c, value: c.label }])).values(),
  ];
  const facility: Option[] = value ? [{ value, label: value }] : [];
  const waiting = (text: string) => (loading ? "A carregar..." : text);
  const pick = (options: Option[]) => options as FacilityOption[];

  return (
    <div className="grid w-full flex-1 gap-2 sm:grid-cols-[1fr_1fr_2fr]">
      <MultipleSelector
        value={province}
        defaultOptions={PROVINCES}
        maxSelected={1}
        floatingList
        placeholder="Todas as Províncias"
        hidePlaceholderWhenSelected
        className={SELECTOR}
        emptyIndicator={<p className="text-center text-sm">Nenhuma Província encontrada</p>}
        onChange={(options) => {
          setProvince(pick(options));
          setDistrict([]);
          onChange("");
        }}
      />
      <MultipleSelector
        value={district}
        options={districtOptions}
        maxSelected={1}
        floatingList
        disabled={loading}
        placeholder={waiting("Todos os Distritos")}
        hidePlaceholderWhenSelected
        className={SELECTOR}
        emptyIndicator={<p className="text-center text-sm">Nenhum Distrito encontrado</p>}
        onChange={(options) => {
          setDistrict(pick(options));
          onChange("");
        }}
      />
      <div className="flex flex-col gap-1">
        <MultipleSelector
          // A facility's name is what the API filters on; one typed by hand still works if the list misses it.
          value={facility}
          options={clinicOptions}
          maxSelected={1}
          floatingList
          creatable
          disabled={loading}
          placeholder={waiting(optional ? "Unidade Sanitária (opcional)" : "Unidade Sanitária")}
          hidePlaceholderWhenSelected
          className={SELECTOR}
          emptyIndicator={<p className="text-center text-sm">Nenhuma Unidade Sanitária encontrada</p>}
          onChange={(options) => onChange(options[0]?.label ?? "")}
        />
        {error && (
          <p className="text-xs text-[#B71D18] dark:text-[#FFAC82]">
            Não foi possível carregar a lista; escreva o nome da Unidade Sanitária.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { AgeRangeDialog } from "@/components/age-range-dialog";
import { FacilityReportCard } from "@repo/design_system/app/organisms/report/facility-report-card";
import { PATIENT_COLUMNS, patientFilterParams } from "@/lib/vl/patients";
import { ageRangeParam, DEFAULT_AGE_RANGE, type AgeRange } from "@/lib/vl/age";
import { CARD_ID, ENDPOINT, patientFiltersFor, TITLE } from "./constants";
import { toChart, toExcel } from "./actions";
import Docs from "./docs";

export default function VlTestedByAge() {
  const [age, setAge] = useState<AgeRange>(DEFAULT_AGE_RANGE);
  const [open, setOpen] = useState(false);
  return (
    <>
      <FacilityReportCard
        cardId={CARD_ID}
        title={TITLE}
        endpoint={ENDPOINT}
        toChart={toChart}
        toExcel={toExcel}
        documentation={<Docs />}
        patientParams={patientFilterParams(patientFiltersFor(age))}
        patientColumns={PATIENT_COLUMNS}
        extraParams={{ age_range: ageRangeParam(age) }}
        footer={<p>Idade: {age[0]}-{age[1]} anos</p>}
        extraOptions={[
          {
            label: "Alterar faixa etária",
            icon: <TbAdjustmentsHorizontal size={20} />,
            type: "primary",
            action: () => setOpen(true),
          },
        ]}
        drill
      />
      <AgeRangeDialog
        open={open}
        onOpenChange={setOpen}
        value={age}
        onApply={(next) => {
          setAge(next);
          setOpen(false);
        }}
      />
    </>
  );
}

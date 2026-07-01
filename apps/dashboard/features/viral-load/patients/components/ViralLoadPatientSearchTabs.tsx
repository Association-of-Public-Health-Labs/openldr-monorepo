"use client";

import { Box, Tab, Tabs } from "@mui/material";
import type { ViralLoadPatientSearchMode } from "../../types/patients";

const tabs: { label: string; value: ViralLoadPatientSearchMode }[] = [
  { label: "Por Unidade Sanitária", value: "facility" },
  { label: "Por Nome", value: "name" },
  { label: "Por Resultado", value: "result_type" },
  { label: "Por Motivo de Teste", value: "test_reason" },
];

type ViralLoadPatientSearchTabsProps = {
  onChange: (value: ViralLoadPatientSearchMode) => void;
  value: ViralLoadPatientSearchMode;
};

export function ViralLoadPatientSearchTabs({ onChange, value }: ViralLoadPatientSearchTabsProps) {
  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 2 }}>
      <Tabs
        allowScrollButtonsMobile
        onChange={(_, nextValue: ViralLoadPatientSearchMode) => onChange(nextValue)}
        scrollButtons="auto"
        value={value}
        variant="scrollable"
        sx={{
          minHeight: 42,
          "& .MuiTab-root": {
            fontSize: 12.5,
            fontWeight: 900,
            letterSpacing: 0,
            minHeight: 42,
            px: 1.4,
            textTransform: "none",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Box>
  );
}

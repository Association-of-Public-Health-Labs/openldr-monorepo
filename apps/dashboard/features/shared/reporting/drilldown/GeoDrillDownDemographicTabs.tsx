"use client";

import { Tab, Tabs } from "@mui/material";
import type { DemographicDimension } from "./types";

export type GeoDrillDownTab = {
  label: string;
  value: DemographicDimension | "patients";
};

type GeoDrillDownDemographicTabsProps = {
  onChange: (value: DemographicDimension | "patients") => void;
  tabs: GeoDrillDownTab[];
  value: DemographicDimension | "patients";
};

export function GeoDrillDownDemographicTabs({ onChange, tabs, value }: GeoDrillDownDemographicTabsProps) {
  return (
    <Tabs
      allowScrollButtonsMobile
      onChange={(_, nextValue) => onChange(nextValue)}
      scrollButtons="auto"
      sx={{ borderBottom: "1px solid", borderColor: "divider", minHeight: 42 }}
      value={value}
      variant="scrollable"
    >
      {tabs.map((tab) => (
        <Tab key={tab.value} label={tab.label} sx={{ minHeight: 42, textTransform: "none" }} value={tab.value} />
      ))}
    </Tabs>
  );
}


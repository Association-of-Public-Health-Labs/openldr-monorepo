import type { ReactNode } from "react";
import type { ReportDateRange } from "../dateRange";

export type ReportModuleId = "tb" | "viral-load" | "dpi";

export type ReportPageId = "summary" | "clinic" | "lab" | "patients";

export type GeoDrillDownLevel = "province" | "district" | "facility" | "patient";

export type DemographicDimension =
  | "age"
  | "breastfeeding"
  | "gender"
  | "none"
  | "pregnancy"
  | "result"
  | "testReason";

export type ReportDocumentation = {
  title: string;
  description?: string;
  interpretation?: string;
  dataSource?: string;
  endpoint?: string;
  calculationNotes?: string;
  limitations?: string;
};

export type ReportActionDateRange = Pick<ReportDateRange, "displayLabel" | "endDateIso" | "intervalDates" | "startDateIso">;

export type ReportFeedbackType = "Dúvida" | "Sugestão" | "Problema nos dados" | "Problema visual";

export type ReportFeedbackPayload = {
  cardId: string;
  cardTitle: string;
  createdAt: string;
  currentPage?: string;
  message: string;
  module: ReportModuleId;
  type: ReportFeedbackType;
  user?: {
    email?: string;
    name?: string;
  };
};

export type ReportDrillDownContext = {
  cardId: string;
  chartType?: string;
  dateRange?: ReportActionDateRange;
  filters?: Record<string, unknown>;
  module: ReportModuleId;
  page: ReportPageId;
  selectedDimension?: string;
  selectedLabel?: string;
  selectedValue?: string | number;
};

export type GeoDrillDownContext = {
  cardId: string;
  currentLevel: GeoDrillDownLevel;
  dateRange?: ReportActionDateRange;
  demographicDimension?: DemographicDimension;
  district?: string;
  facility?: string;
  filters?: Record<string, unknown>;
  metric?: string;
  module: ReportModuleId;
  page: ReportPageId;
  province?: string;
  selectedLabel?: string;
  selectedValue?: string | number;
};

export type ReportDrillDownRow = {
  id: string;
  label: string;
  value?: ReactNode;
  description?: ReactNode;
};

export type GeoDrillDownRow = {
  id: string;
  label: string;
  metadata?: Record<string, unknown>;
  nextLevel?: GeoDrillDownLevel;
  percentage?: number;
  value: number;
};

export type PatientDrillDownRow = {
  district?: string;
  facility?: string;
  id: string;
  identifier?: string;
  patientName: string;
  province?: string;
  result?: string;
  resultDate?: string;
  sampleDate?: string;
  status?: string;
  testReason?: string;
  viralLoad?: string | number;
};

export type ReportCardActionsConfig = {
  cardId: string;
  cardTitle: string;
  dateRange?: ReportActionDateRange;
  documentation?: ReportDocumentation;
  drillDown?: ReportDrillDownContext;
  drillDownDescription?: string;
  drillDownRows?: ReportDrillDownRow[];
  drillDownTitle?: string;
  enableDateFilter?: boolean;
  enableFeedback?: boolean;
  module: ReportModuleId;
  onDrillDownOpen?: () => void;
  page: ReportPageId;
};

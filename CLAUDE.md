# Open Laboratory Data Repository (OpenLDR) - Monorepo

## Introduction

This is a monorepo for building data analysis and visualization dashboards for laboratory data. The project focuses on Tuberculosis (TB) diagnostic data with support for multiple test types (Ultra MTB, XDR MTB). It features a shared design system based on Atomic Design principles, comprehensive export capabilities, and a hierarchical facility navigation system.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Report Development Guide](#report-development-guide)
5. [Design System](#design-system)
6. [API Patterns](#api-patterns)
7. [Export Utilities](#export-utilities)
8. [Best Practices](#best-practices)
9. [Code Templates](#code-templates)

---

## Architecture Overview

### Monorepo Organization

```
openldr-monorepo/
├── apps/                         # Application projects
│   ├── tb/                       # Tuberculosis Dashboard (primary)
│   ├── main-app/                 # Main application
│   └── protocol/                 # Protocol related app
├── packages/                     # Shared packages
│   ├── design_system/            # Core design system (Tailwind/Radix UI)
│   ├── design_system_mui/        # Material UI components layer
│   ├── auth/                     # Authentication (Clerk-based)
│   ├── ai/                       # AI/LLM integration
│   ├── utilities/                # Shared utility functions
│   ├── typescript-config/        # Shared TS configurations
│   └── eslint-config/            # Shared ESLint configurations
├── turbo.json                    # Turbo build configuration
├── pnpm-workspace.yaml           # PNPM workspace config
└── package.json                  # Root package.json
```

### Package Relationships

- **@repo/design_system**: Root design system package. All UI components are imported from here.
- **@repo/design_system_mui**: Material UI layer. Components are re-exported through `@repo/design_system`.
- **@repo/auth**: Authentication using Clerk. All apps share the same auth logic.

---

## Technology Stack

### Core Framework
- **Next.js**: v15.3.2 (App Router, Server Actions)
- **React**: v18.3.1
- **TypeScript**: v5.5.4+

### UI & Styling
- **Tailwind CSS**: v4 (utility-first CSS)
- **Material UI**: v6.1.10 (MUI X Date Pickers)
- **Radix UI**: v1+ (unstyled, accessible components)
- **Emotion**: v11.14.0 (CSS-in-JS for MUI)

### Charts & Visualization
- **ApexCharts**: v5.3.4 (primary charting library)
- **React ApexCharts**: v1.7.0
- **Recharts**: v2.15.4 (alternative charts)
- **Chart.js**: v4.4.7 (with plugins)

### Data Export
- **XLSX**: v0.18.5 (Excel export)
- **html2canvas**: v1.4.1 (chart to image export)

### Authentication
- **Clerk**: v6.18.5 (user authentication)
- **Clerk NextJS**: v6.18.5

### State & Data
- **Zustand**: v5.0.4 (state management)
- **Axios**: v1.8.3 (HTTP client)
- **TanStack React Table**: v8.21.3 (advanced tables)

### Icons
- **React Icons**: v5.4.0
- **Lucide React**: v0.482.0
- **Tabler Icons**: v3.34.1
- **MUI Icons Material**: v7.3.2

---

## Project Structure

### TB Dashboard Application

```
apps/tb/
├── app/
│   ├── (dashboard)/
│   │   ├── lab/
│   │   │   ├── page.tsx              # Lab reports page
│   │   │   └── reports/              # Individual reports
│   │   │       ├── mtb-registered-by-lab/
│   │   │       ├── mtb-registered-by-month/
│   │   │       ├── mtb-rejected-samples-by-lab/
│   │   │       ├── mtb-rejected-samples-by-month/
│   │   │       ├── mtb-rejected-samples-by-lab-and-reason/
│   │   │       └── mtb-rejected-samples-by-month-and-reason/
│   │   ├── clinic/                   # Clinic reports
│   │   ├── patient/                  # Patient reports
│   │   └── summary/                  # Summary/Home
│   ├── api/                          # API routes
│   └── layout.tsx                    # Root layout
├── components/                       # App-specific components
├── config/
│   └── api.ts                        # API configuration
└── middleware.ts                     # Clerk auth middleware
```

### Report Directory Structure

Each report follows this standard structure:

```
report-name/
├── index.tsx                    # Main React component (UI)
├── actions.ts                   # API calls, data transformation (Logic)
├── constants.ts                 # Configuration, defaults, API endpoints
├── excel-export-utils.ts        # Excel export functionality
├── chart-export-utils.ts        # Chart to PNG export
└── docs.tsx                     # Report documentation component
```

---

## Report Development Guide

### 1. Report State Structure

Every report uses a consistent state pattern:

```typescript
interface ReportState {
  data: Data[];                    // API response data
  loading: boolean;                // Loading indicator
  error: string | null;            // Error message
  activeTab: ActiveTab;            // "ultra" | "xdr"
  timeInterval: TimeInterval;      // { startDate, endDate }
  facilities: FacilityOptions[];   // Selected facilities
  facilityType: FacilityType;      // "province" | "district" | "clinic" | "patients"
  disaggregation: boolean;         // Data breakdown flag
}

interface PatientDialogState {
  open: boolean;
  data: any[];
  loading: boolean;
}
```

### 2. Facility Hierarchy Navigation

Reports support drilling down through a facility hierarchy:

```
Province → District → Clinic → Patient Details
```

The hierarchy is controlled by `facilityType` and navigation is handled via:

```typescript
export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const hierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "patients",
    patients: "province"
  };
  return hierarchy[currentType];
};
```

### 3. Tab System

Reports support Ultra and XDR MTB test types via tabs:

```typescript
type ActiveTab = "ultra" | "xdr";

const TAB_OPTIONS = [
  { value: "ultra", label: "Ultra" },
  { value: "xdr", label: "XDR" },
];

// Map tabs to API parameters
const getGenexpertResultType = (activeTab: ActiveTab): string => {
  const resultTypes = {
    ultra: "Ultra 6 Cores",
    xdr: "XDR 10 Cores"
  };
  return resultTypes[activeTab];
};
```

### 4. Dynamic Subtitle

Reports display a dynamic subtitle showing the current filter state:

```typescript
const dynamicSubtitle = useMemo(() => {
  const { startDate, endDate } = reportState.timeInterval;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const dateRange = `${formatDate(startDate)} à ${formatDate(endDate)}`;

  if (clickedLabels.length === 0) return dateRange;

  const labelsText = clickedLabels.join(' → ');
  return `${dateRange} | ${labelsText}`;
}, [reportState, clickedLabels]);
```

---

## Design System

### Atomic Design Pattern

The design system follows Atomic Design methodology:

```
src/
├── atoms/                          # Basic building blocks
│   ├── charts/
│   │   ├── apex/                   # ApexCharts wrappers
│   │   │   ├── Stacked.tsx         # Bar/Column charts
│   │   │   ├── Line.tsx            # Line charts
│   │   │   ├── Pie.tsx             # Pie charts
│   │   │   └── ...
│   │   └── chartjs/                # Chart.js wrappers
│   ├── typography/
│   ├── inputs/
│   ├── pickers/
│   └── tables/
│
├── molecules/                      # Atom combinations
│   ├── cards/
│   │   └── MainCardHeader.tsx
│   ├── headers/
│   ├── sidebar/
│   └── skeletons/
│
├── organisms/                      # Complex components
│   ├── cards/
│   │   ├── MainCard.tsx            # Primary report wrapper
│   │   ├── FacilitiesSelector.tsx
│   │   ├── StatusCard.tsx
│   │   └── MapCard.tsx
│   ├── popups/
│   │   ├── DateRange.tsx
│   │   ├── FacilitiesPopup.tsx
│   │   ├── LabDialog.tsx
│   │   ├── CardDocsPopup.tsx
│   │   ├── SuggestionsPopup.tsx
│   │   └── PatientsDataDialog.tsx
│   └── headers/
│       └── MainHeader.tsx
│
└── templates/
    └── DashboardLayout.tsx
```

### MainCard Component

The `MainCard` is the primary wrapper for all reports:

```typescript
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";

type MainCardProps = {
  id?: string;
  chartId?: string;                    // For chart export identification
  title?: string;                      // Report title
  subtitle?: string;                   // Dynamic subtitle
  width?: string | number;
  height?: string | number;
  reportType?: "national" | "lab" | "facility";  // Dialog type
  labType?: "conventional" | "poc";
  additionalOptions?: MainCardHeaderOptions[];   // Menu options
  children?: React.ReactNode;
  loading?: boolean;
  documentation?: React.ReactNode;     // Docs component
  handleSubmit?: (                     // Filter callback
    dates: [string, string],
    facilities?: SelectPickerOptionsProps[],
    facilityType?: "province" | "district" | "clinic",
    disaggregation?: "true" | "false",
    labType?: "conventional" | "poc" | "all"
  ) => void;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
};
```

### MainCard Options Pattern

```typescript
const mainCardOptions = useMemo(() => [
  {
    action: handleExportToExcel,
    icon: <PiMicrosoftExcelLogoFill size={20} />,
    label: "Exportar para Excel",
    type: "primary" as const
  },
  {
    action: handleExportToImage,
    icon: <IoImageOutline size={20} />,
    label: "Exportar imagem",
    type: "primary" as const
  },
  {
    action: handleRestart,
    icon: <VscDebugRestart size={20} />,
    label: "Reiniciar o relatorio",
    type: "primary" as const
  },
], [handleExportToExcel, handleExportToImage, handleRestart]);
```

### Stacked Chart Component

```typescript
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";

type StackedProps = {
  labels: string[];                    // X-axis labels
  series: StackedSerieProps[];         // Data series
  yLabel?: string;                     // Y-axis label
  width?: number | string;
  height?: number | string;
  id?: string;                         // Required for export
  onClick?: (label: string) => void;   // Click handler for drill-down
  colors?: string[];                   // Custom colors
};

type StackedSerieProps = {
  name?: string;
  data: number[];
};

// Usage
<Stacked
  id="tb-stacked-chart"
  height={350}
  labels={chartData?.labels}
  series={chartData?.series}
  onClick={handleChartClick}
/>
```

---

## API Patterns

### API Configuration

```typescript
// apps/tb/config/api.ts
import axios from "axios";

export const api = (token: string) => axios.create({
  baseURL: process.env.NEXT_PUBLIC_OPENLDR_API,
  timeout: 60000,
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});
```

### Constants Configuration

```typescript
// constants.ts
export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/registered_samples_by_month/`,
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
  REPORT_NAME: "Relatório de Amostras Registadas por mês",
} as const;

export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "tb-stacked-chart",
  SERIES_NAME: "Amostras Registadas",
  COLORS: {
    ULTRA: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    XDR: ["#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  }
} as const;
```

### Building API Parameters

```typescript
export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
): Record<string, any> => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False"
  };

  const districtValues = [...new Set(
    facilities.map(f => f.district).filter(Boolean)
  )];
  const provinceValues = [...new Set(
    facilities.map(f => f.province).filter(Boolean)
  )];

  return {
    ...baseParams,
    ...(districtValues?.length > 0 && { district: districtValues }),
    ...(provinceValues?.length > 0 && { province: provinceValues }),
  };
};
```

### Fetching Data

```typescript
export const fetchFacilityData = async (
  params: Record<string, any>,
  token: string
): Promise<Data[]> => {
  try {
    const response = await api(token).get(API_CONFIG.BASE_URL, {
      params,
      paramsSerializer: { indexes: null },  // Array params without indices
      timeout: API_CONFIG.TIMEOUT
    });

    if (!response.data?.length) return [];
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";

    console.error("Error fetching facility data:", errorMessage);
    throw new Error(errorMessage);
  }
};
```

### API Response Types

```typescript
export type Data = {
  Month?: number;
  Month_Name?: string;
  Year?: number;
  Resgistered_Samples: number;      // Note: typo in API
  Rejected_Samples?: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;           // "Ultra 6 Cores" | "XDR 10 Cores"
  Lab_Type: string;                 // "Conventional" | "Point_Of_Care"
  Testing_Facility?: string;
  Rejection_Reason?: string;
};

export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export interface TimeInterval {
  startDate: string;
  endDate: string;
}
```

### Available API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/tb/gx/laboratories/registered_samples_by_month/` | Monthly registered samples |
| `/tb/gx/laboratories/registered_samples_by_lab/` | Lab-level registered samples |
| `/tb/gx/laboratories/rejected_samples_by_month/` | Monthly rejected samples |
| `/tb/gx/laboratories/rejected_samples_by_lab/` | Lab-level rejected samples |
| `/tb/gx/laboratories/rejected_samples_by_reason/` | Rejection reason breakdown |
| `/dict/facilities/province/districts/` | Facility dictionary |

---

## Export Utilities

### Excel Export

```typescript
// excel-export-utils.ts

import * as XLSX from 'xlsx';

interface ExcelExportOptions {
  data: any[];
  title: string;
  fileName: string;
  sheetName: string;
  headers?: string[];
}

export async function exportChartToExcel(
  chartData: { labels: string[], series: any[] },
  reportState: any,
  reportName: string,
  getFacilityProperty: (facilityType: string, label: string) => any
): Promise<void> {
  // 1. Prepare data for Excel
  const exportData = prepareChartDataForExcel(
    chartData.labels,
    chartData.series,
    reportState,
    getFacilityProperty
  );

  // 2. Build report title with hierarchy
  const title = buildReportTitle(reportName, reportState);

  // 3. Create and save workbook
  const options: ExcelExportOptions = {
    data: exportData,
    title,
    fileName: `${reportName}_${reportState.activeTab}`,
    sheetName: reportName,
  };

  await exportToExcel(options);
}

function prepareChartDataForExcel(
  chartLabels: string[],
  chartSeries: any[],
  reportState: any,
  getFacilityProperty: (facilityType: string, label: string) => any
): any[] {
  const facilityTypeLabels = {
    province: "Província",
    district: "Distrito",
    clinic: "Laboratório",
    lab: "Laboratório"
  };

  const facilityTypeLabel = facilityTypeLabels[reportState.facilityType] || "Laboratório";

  return reportState.data.map(item => ({
    [facilityTypeLabel]: item.Testing_Facility,
    'Amostras Registadas': item.Resgistered_Samples,
    'Tipo de Resultado': reportState.activeTab.toUpperCase(),
    'Tipo de Laboratório': item.Lab_Type,
    'Período': `${reportState.timeInterval.startDate} à ${reportState.timeInterval.endDate}`,
  }));
}
```

### Chart Image Export

```typescript
// chart-export-utils.ts

import html2canvas from 'html2canvas';

// Multi-strategy export with fallbacks
export const exportChart = async (chartId: string, reportName: string): Promise<void> => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}.png`;

  // Strategy 1: ApexCharts native export
  const apexSuccess = await exportViaApexCharts(chartId, filename);
  if (apexSuccess) return;

  // Strategy 2: html2canvas with OKLCH color fix
  const html2canvasSuccess = await exportViaHtml2Canvas(chartId, filename);
  if (html2canvasSuccess) return;

  // Strategy 3: Direct canvas export
  const directCanvasSuccess = await exportViaDirectCanvas(chartId, filename);
  if (directCanvasSuccess) return;

  // Strategy 4: SVG conversion
  const svgSuccess = await exportViaSvgConversion(chartId, filename);
  if (svgSuccess) return;

  throw new Error('Todas as estratégias de exportação falharam');
};

// OKLCH color conversion (required for Tailwind CSS v4)
const convertOklchToRgb = (oklchValue: string): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#666666';

    ctx.fillStyle = oklchValue;
    const computedColor = ctx.fillStyle;

    if (computedColor && computedColor !== oklchValue) {
      return computedColor;
    }
  } catch (error) {
    console.warn('Failed to convert OKLCH color:', oklchValue);
  }
  return '#666666';
};
```

---

## Best Practices

### 1. Report Component Structure

```typescript
"use client"

// 1. Imports - grouped by type
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

// Design system imports
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";

// Local imports
import { DEFAULTS, CHART_CONFIG } from "./constants";
import { buildApiParams, fetchFacilityData, prepareChartData } from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";

// 2. Types
interface ReportState { /* ... */ }
interface PatientDialogState { /* ... */ }

// 3. Component
export default function ReportComponent() {
  // 3a. Hooks
  const { user } = useUser();
  const { getToken } = useAuth();

  // 3b. State
  const [reportState, setReportState] = useState<ReportState>({ /* ... */ });
  const [patientDialog, setPatientDialog] = useState<PatientDialogState>({ /* ... */ });
  const [clickedLabels, setClickedLabels] = useState<string[]>([]);

  // 3c. Memoized values
  const dynamicSubtitle = useMemo(() => { /* ... */ }, [reportState, clickedLabels]);
  const chartData = useMemo(() => prepareChartData(reportState.data), [reportState.data]);

  // 3d. API functions (useCallback)
  const fetchDataFromApi = useCallback(async () => { /* ... */ }, [/* deps */]);

  // 3e. Event handlers (useCallback)
  const handleChartClick = useCallback(async (label: string) => { /* ... */ }, [/* deps */]);
  const handleSubmit = useCallback(async () => { /* ... */ }, []);
  const handleRestart = useCallback(() => { /* ... */ }, []);

  // 3f. Effects
  useEffect(() => { /* Initial data fetch */ }, [/* deps */]);

  // 3g. Render
  return (
    <MainCard /* props */>
      {/* Content */}
    </MainCard>
  );
}
```

### 2. Naming Conventions

- **Report directories**: `kebab-case` (e.g., `mtb-registered-by-month`)
- **Component files**: `PascalCase` for components, `kebab-case` for utilities
- **Portuguese labels**: All user-facing text in Portuguese
- **API parameters**: `snake_case` (matching API)
- **TypeScript types**: `PascalCase`

### 3. State Management

- Use local `useState` for report-specific state
- Group related state into objects (e.g., `reportState`)
- Use `useCallback` for functions passed to children
- Use `useMemo` for expensive computations

### 4. Error Handling

```typescript
try {
  setReportState(prev => ({ ...prev, loading: true, error: null }));
  const data = await fetchFacilityData(params, token);
  setReportState(prev => ({ ...prev, data, loading: false }));
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro";
  setReportState(prev => ({ ...prev, loading: false, error: errorMessage }));
}
```

### 5. Documentation Component

Each report should have a `docs.tsx` with:
- Overview (Visão Geral)
- Chart visualization explanation
- Features list
- Usage instructions
- Technical notes (API endpoint, timeout, etc.)

---

## Code Templates

### New Report Template

```typescript
// index.tsx
"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULTS, CHART_CONFIG } from "./constants";
import {
  FacilityType, FacilityOptions, ActiveTab, Data, TimeInterval,
  buildApiParams, prepareChartData, fetchFacilityData, getReportName
} from "./actions";
import { exportChartToExcel } from "./excel-export-utils";
import { exportChart } from "./chart-export-utils";
import { useAuth, useUser } from "@clerk/nextjs";

interface ReportState {
  data: Data[];
  loading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  timeInterval: TimeInterval;
  facilities: FacilityOptions[];
  facilityType: FacilityType;
  disaggregation: boolean;
}

export default function NewReport() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [reportState, setReportState] = useState<ReportState>({
    data: [],
    loading: true,
    error: null,
    activeTab: DEFAULTS.ACTIVE_TAB,
    timeInterval: DEFAULTS.TIME_INTERVAL,
    facilities: [],
    facilityType: DEFAULTS.FACILITY_TYPE,
    disaggregation: DEFAULTS.DISAGGREGATION,
  });

  const [clickedLabels, setClickedLabels] = useState<string[]>([]);

  const dynamicSubtitle = useMemo(() => {
    const { startDate, endDate } = reportState.timeInterval;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };
    const dateRange = `${formatDate(startDate)} à ${formatDate(endDate)}`;
    if (clickedLabels.length === 0) return dateRange;
    return `${dateRange} | ${clickedLabels.join(' → ')}`;
  }, [reportState.timeInterval, clickedLabels]);

  const chartData = useMemo(() => prepareChartData(reportState.data), [reportState.data]);
  const reportName = useMemo(() => getReportName(reportState.activeTab), [reportState.activeTab]);

  const fetchDataFromApi = useCallback(async (
    startDate: string,
    endDate: string,
    disaggregation: boolean,
    facilities: FacilityOptions[],
    facilityType?: FacilityType
  ) => {
    try {
      setReportState(prev => ({ ...prev, loading: true, error: null }));
      const token = await getToken();
      const params = buildApiParams(
        { startDate, endDate },
        reportState.activeTab,
        facilities,
        facilityType || reportState.facilityType,
        disaggregation
      );
      const data = await fetchFacilityData(params, token);
      setReportState(prev => ({ ...prev, data, loading: false, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro";
      setReportState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [reportState.activeTab, reportState.facilityType, getToken]);

  const handleExportToImage = useCallback(async () => {
    await exportChart(CHART_CONFIG.CHART_ID, reportName);
  }, [reportName]);

  const handleExportToExcel = useCallback(async () => {
    await exportChartToExcel(chartData, reportState, DEFAULTS.REPORT_NAME, () => ({}));
  }, [chartData, reportState]);

  const handleRestart = useCallback(() => {
    setClickedLabels([]);
    setReportState(prev => ({
      ...prev,
      disaggregation: DEFAULTS.DISAGGREGATION,
      facilities: [],
      facilityType: DEFAULTS.FACILITY_TYPE,
      timeInterval: DEFAULTS.TIME_INTERVAL,
      activeTab: DEFAULTS.ACTIVE_TAB
    }));
  }, []);

  const handleTabChange = useCallback((newTab: ActiveTab) => {
    setReportState(prev => ({ ...prev, activeTab: newTab }));
  }, []);

  const handleSubmit = useCallback(async (
    dates: string[],
    facilities: FacilityOptions[],
    facilityType: FacilityType
  ) => {
    setClickedLabels([]);
    const disaggregation = facilityType !== "province";
    setReportState(prev => ({
      ...prev,
      facilities,
      facilityType: "district",
      timeInterval: { startDate: dates[0], endDate: dates[1] },
      disaggregation,
      activeTab: DEFAULTS.ACTIVE_TAB
    }));
  }, []);

  useEffect(() => {
    fetchDataFromApi(
      reportState.timeInterval.startDate,
      reportState.timeInterval.endDate,
      reportState.disaggregation,
      reportState.facilities,
      reportState.facilityType
    );
  }, [reportState.timeInterval, reportState.disaggregation, reportState.facilities,
      reportState.facilityType, reportState.activeTab, fetchDataFromApi]);

  const mainCardOptions = useMemo(() => [
    { action: handleExportToExcel, icon: <PiMicrosoftExcelLogoFill size={20} />, label: "Exportar para Excel", type: "primary" as const },
    { action: handleExportToImage, icon: <IoImageOutline size={20} />, label: "Exportar imagem", type: "primary" as const },
    { action: handleRestart, icon: <VscDebugRestart size={20} />, label: "Reiniciar o relatorio", type: "primary" as const },
  ], [handleExportToExcel, handleExportToImage, handleRestart]);

  return (
    <MainCard
      additionalOptions={mainCardOptions}
      chartId={CHART_CONFIG.CHART_ID}
      height="auto"
      labType="poc"
      loading={reportState.loading}
      reportType="lab"
      subtitle={dynamicSubtitle}
      title={reportName}
      user={{ email: user?.emailAddresses[0].emailAddress, name: user?.fullName || "" }}
      width="100%"
      handleSubmit={handleSubmit as any}
    >
      <Tabs defaultValue={DEFAULTS.ACTIVE_TAB} className="w-full" onValueChange={handleTabChange}>
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">Ultra</TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">XDR</TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <Stacked id={CHART_CONFIG.CHART_ID} height={CHART_CONFIG.HEIGHT} labels={chartData?.labels} series={chartData?.series} />
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
          <Stacked id={CHART_CONFIG.CHART_ID} height={CHART_CONFIG.HEIGHT} labels={chartData?.labels} series={chartData?.series} />
        </TabsContent>
      </Tabs>
    </MainCard>
  );
}
```

### Constants Template

```typescript
// constants.ts
import { getLastTwelveMonths, FacilityType } from "./actions";

export const formatDateInPortuguese = (dateString: string): string => {
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const date = new Date(dateString);
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

export const API_CONFIG = {
  BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/YOUR_ENDPOINT/`,
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const DEFAULTS = {
  TIME_INTERVAL: getLastTwelveMonths(),
  FACILITY_TYPE: "province" as FacilityType,
  ACTIVE_TAB: "ultra" as const,
  DISAGGREGATION: false,
  REPORT_NAME: "Nome do Relatório em Português",
} as const;

export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "unique-chart-id",
  SERIES_NAME: "Nome da Série",
  COLORS: {
    ULTRA: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    XDR: ["#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  }
} as const;

export const UI_CONFIG = {
  TAB_OPTIONS: [
    { value: "ultra", label: "Ultra" },
    { value: "xdr", label: "XDR" },
  ] as const,
} as const;
```

### Actions Template

```typescript
// actions.ts
import { API_CONFIG } from "./constants";
import { api } from "@/config/api";
import { AxiosError } from "axios";

// Types
export interface FacilityOptions {
  value: string;
  label: string;
  district: string;
  province: string;
}

export type Data = {
  Month?: number;
  Month_Name?: string;
  Year?: number;
  Resgistered_Samples?: number;
  Rejected_Samples?: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;
  Lab_Type: string;
  Testing_Facility?: string;
}

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface ChartData {
  labels: string[];
  series: Array<{ name: string; data: number[]; }>;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

// Helper functions
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Relatório Xpert MTB Ultra" : "Relatório Xpert MTB XDR";
};

export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const hierarchy: Record<FacilityType, FacilityType> = {
    province: "district", district: "clinic", clinic: "patients", patients: "province"
  };
  return hierarchy[currentType];
};

// API functions
export const buildApiParams = (
  timeInterval: TimeInterval,
  activeTab: ActiveTab,
  facilities: FacilityOptions[],
  facilityType: FacilityType,
  disaggregation: boolean
): Record<string, any> => {
  const baseParams = {
    interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
    genexpert_result_type: getGenexpertResultType(activeTab),
    disaggregation: disaggregation ? "True" : "False"
  };

  const districtValues = [...new Set(facilities.map(f => f.district).filter(Boolean))];
  const provinceValues = [...new Set(facilities.map(f => f.province).filter(Boolean))];

  return {
    ...baseParams,
    ...(districtValues.length > 0 && { district: districtValues }),
    ...(provinceValues.length > 0 && { province: provinceValues }),
  };
};

export const fetchFacilityData = async (
  params: Record<string, any>,
  token: string
): Promise<Data[]> => {
  try {
    const response = await api(token).get(API_CONFIG.BASE_URL, {
      params,
      paramsSerializer: { indexes: null },
      timeout: API_CONFIG.TIMEOUT
    });
    return response.data?.length ? response.data : [];
  } catch (error) {
    const errorMessage = error instanceof AxiosError
      ? error.response?.data?.message || error.message
      : error instanceof Error ? error.message : "An error occurred";
    throw new Error(errorMessage);
  }
};

// Data transformation
export const prepareChartData = (data: Data[]): ChartData => {
  if (data.length === 0) return { labels: [], series: [] };

  const labels = data.map(item => item.Testing_Facility || item.Month_Name || '');
  const series = [{
    name: 'Dados',
    data: data.map(item => item.Resgistered_Samples || item.Rejected_Samples || 0),
  }];

  return { labels, series };
};

export const createFacilityOptions = (
  label: string,
  currentFacilityType: FacilityType,
  currentFacilities: FacilityOptions[]
): FacilityOptions => {
  const currentFacility = currentFacilities[0];
  return {
    value: label,
    label,
    district: currentFacilityType === "district" ? label : currentFacility?.district || "",
    province: currentFacilityType === "province" ? label : currentFacility?.province || ""
  };
};
```

---

## Environment Variables

Required environment variables for the TB dashboard:

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***

# API
NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz

# Email (for suggestions feature)
RESEND_API_KEY=re_***
SUGGESTION_EMAILS=email1@example.com,email2@example.com
DASHBOARD_EMAIL=dashboard@openldr.org.mz
```

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server (all apps)
pnpm dev

# Build all packages and apps
pnpm build

# Lint all packages
pnpm lint

# Format code
pnpm format

# Run Storybook (design system)
pnpm storybook
```

---

## Adding a New Report

1. **Create the report directory** in `apps/tb/app/(dashboard)/lab/reports/`
2. **Create the required files**: `index.tsx`, `actions.ts`, `constants.ts`, `excel-export-utils.ts`, `chart-export-utils.ts`, `docs.tsx`
3. **Configure the API endpoint** in `constants.ts`
4. **Define data types** in `actions.ts` based on API response
5. **Implement the chart data transformation** in `prepareChartData`
6. **Add the report component** to the parent page (e.g., `lab/page.tsx`)
7. **Create documentation** in `docs.tsx`

---

## Quick Reference

### Import Paths

```typescript
// Design System
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Auth
import { useAuth, useUser } from "@clerk/nextjs";

// Icons
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";

// Config
import { api } from "@/config/api";
```

### MainCard Report Types

| reportType | Dialog Component | Use Case |
|------------|-----------------|----------|
| `"national"` | DateRange | National-level reports |
| `"lab"` | LabDialog | Laboratory-specific reports |
| `"facility"` | FacilitiesPopup | Facility-based reports |

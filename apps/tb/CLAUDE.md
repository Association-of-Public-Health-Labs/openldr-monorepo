# TB Dashboard Application

## Overview

The TB (Tuberculosis) Dashboard is the primary application in the OpenLDR monorepo. It provides data visualization and analytics for tuberculosis diagnostic data, supporting GeneXpert MTB test results (Ultra 6 Cores and XDR 10 Cores). The dashboard features hierarchical facility navigation, interactive charts, and comprehensive export capabilities.

---

## Table of Contents

1. [Application Structure](#application-structure)
2. [Pages & Routes](#pages--routes)
3. [Reports System](#reports-system)
4. [Creating New Reports](#creating-new-reports)
5. [Components Reference](#components-reference)
6. [API Integration](#api-integration)
7. [Authentication](#authentication)
8. [Environment Variables](#environment-variables)

---

## Application Structure

```
apps/tb/
├── app/
│   ├── (dashboard)/                    # Dashboard route group
│   │   ├── layout.tsx                  # Dashboard layout with sidebar
│   │   ├── lab/                        # Laboratory section
│   │   │   ├── page.tsx                # Lab reports page
│   │   │   └── reports/                # Individual lab reports
│   │   │       ├── mtb-registered-by-lab/
│   │   │       ├── mtb-registered-by-month/
│   │   │       ├── mtb-rejected-samples-by-lab/
│   │   │       ├── mtb-rejected-samples-by-month/
│   │   │       ├── mtb-rejected-samples-by-lab-and-reason/
│   │   │       └── mtb-rejected-samples-by-month-and-reason/
│   │   ├── clinic/                     # Clinic section
│   │   ├── patient/                    # Patient section
│   │   └── summary/                    # Summary/Home section
│   ├── api/                            # API routes
│   │   └── send-suggestion/            # Suggestion email endpoint
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Landing page
├── components/                         # App-specific components
│   ├── ui/                             # Shadcn UI components
│   │   └── tabs.tsx                    # Tabs component
│   └── patients-data-dialog.tsx        # Patient details dialog
├── config/
│   └── api.ts                          # Axios API configuration
├── middleware.ts                       # Clerk authentication middleware
├── next.config.ts                      # Next.js configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
└── .env.local                          # Environment variables (not in git)
```

---

## Pages & Routes

### Dashboard Sections

| Route | Section | Description |
|-------|---------|-------------|
| `/summary` | Summary | Main overview with key indicators |
| `/lab` | Laboratory | Laboratory-level TB data reports |
| `/clinic` | Clinic | Health facility-level data |
| `/patient` | Patient | Individual patient results |

### Lab Reports Page

The `/lab` page renders all laboratory reports in a responsive grid:

```typescript
// app/(dashboard)/lab/page.tsx
export default function LabPage() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          <MTBRegisteredByLab />
          <MTBRegisteredByMonth />
          <MTBRejectedSamplesByLab />
          <MTBRejectedSamplesByMonth />
          <MTBRejectedSamplesByLabAndReason />
          <MTBRejectedSamplesByMonthAndReason />
        </div>
      </div>
    </div>
  );
}
```

---

## Reports System

### Available Reports

| Report | Directory | API Endpoint | Description |
|--------|-----------|--------------|-------------|
| Registered by Lab | `mtb-registered-by-lab/` | `/registered_samples_by_lab/` | Samples registered per laboratory |
| Registered by Month | `mtb-registered-by-month/` | `/registered_samples_by_month/` | Monthly registration trends |
| Rejected by Lab | `mtb-rejected-samples-by-lab/` | `/rejected_samples_by_lab/` | Rejected samples per laboratory |
| Rejected by Month | `mtb-rejected-samples-by-month/` | `/rejected_samples_by_month/` | Monthly rejection trends |
| Rejected by Lab & Reason | `mtb-rejected-samples-by-lab-and-reason/` | `/rejected_samples_by_reason/` | Rejection reasons per lab |
| Rejected by Month & Reason | `mtb-rejected-samples-by-month-and-reason/` | `/rejected_samples_by_reason/` | Monthly rejection by reason |

### Report File Structure

Each report directory contains 6 files:

```
report-name/
├── index.tsx              # Main React component
├── actions.ts             # API functions & data transformation
├── constants.ts           # Configuration & defaults
├── excel-export-utils.ts  # Excel export logic
├── chart-export-utils.ts  # PNG export logic
└── docs.tsx               # Documentation component (Portuguese)
```

### Report Features

All reports share these capabilities:

- **Date Range Selection**: Filter by custom date range (default: last 12 months)
- **Facility Hierarchy**: Drill-down from Province → District → Clinic → Patient
- **Tab Switching**: Toggle between Ultra and XDR MTB test types
- **Excel Export**: Download formatted spreadsheet
- **PNG Export**: Download chart as image
- **Documentation**: In-app documentation popup
- **Suggestions**: User feedback submission
- **Restart**: Reset to default filters

---

## Creating New Reports

### Step 1: Create Report Directory

```bash
mkdir -p app/(dashboard)/lab/reports/new-report-name
```

### Step 2: Create constants.ts

```typescript
import { getLastTwelveMonths, FacilityType } from "./actions";

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
  REPORT_NAME: "Nome do Relatório",  // Portuguese
} as const;

export const CHART_CONFIG = {
  HEIGHT: 350,
  CHART_ID: "new-report-chart",  // Unique ID for export
  SERIES_NAME: "Nome da Série",
  COLORS: {
    ULTRA: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    XDR: ["#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
  }
} as const;
```

### Step 3: Create actions.ts

```typescript
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
};

export interface TimeInterval {
  startDate: string;
  endDate: string;
}

export interface ChartData {
  labels: string[];
  series: Array<{ name: string; data: number[] }>;
}

export type FacilityType = "province" | "district" | "clinic" | "patients";
export type ActiveTab = "ultra" | "xdr";

// Helper functions
export const getLastTwelveMonths = (): TimeInterval => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 11);
  startDate.setDate(1);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

export const getGenexpertResultType = (activeTab: ActiveTab): string => {
  return activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores";
};

export const getReportName = (activeTab: ActiveTab): string => {
  return activeTab === "ultra"
    ? "Relatório Xpert MTB Ultra"
    : "Relatório Xpert MTB XDR";
};

export const getNextFacilityType = (currentType: FacilityType): FacilityType => {
  const hierarchy: Record<FacilityType, FacilityType> = {
    province: "district",
    district: "clinic",
    clinic: "patients",
    patients: "province"
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

### Step 4: Create index.tsx

```typescript
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

  // Dynamic subtitle with date range and breadcrumb trail
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

  // Fetch data from API
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

  // Event handlers
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

  // Initial data fetch and refetch on filter changes
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

  // MainCard action options
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

### Step 5: Copy Export Utilities

Copy and adapt `excel-export-utils.ts` and `chart-export-utils.ts` from an existing report.

### Step 6: Create docs.tsx

```typescript
import React from 'react';
import { Typography, Box, Paper, List, ListItem, ListItemText, Alert } from '@mui/material';

export default function NewReportDocs() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold">
          Nome do Relatório
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Documentação do relatório
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Visão Geral
        </Typography>
        <Typography variant="body1" paragraph>
          Descrição do que o relatório mostra e como pode ser utilizado.
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Como Utilizar
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="1. Seleção do Período"
              secondary="Use o filtro de datas para selecionar o período de análise"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Alternância entre Tipos de Teste"
              secondary="Use as tabs Ultra e XDR para alternar entre tipos de teste"
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Notas Técnicas
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/YOUR_ENDPOINT/`
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
```

### Step 7: Add to Page

Import and add the component to the parent page:

```typescript
// app/(dashboard)/lab/page.tsx
import NewReport from "./reports/new-report-name";

export default function LabPage() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 @container gap-8">
        <div className="@[900px]:grid-cols-2 grid gap-8">
          {/* Existing reports */}
          <NewReport />
        </div>
      </div>
    </div>
  );
}
```

---

## Components Reference

### Design System Components

Import from `@repo/design_system`:

```typescript
// Cards
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { StatusCard } from "@repo/design_system/app/organisms/cards/StatusCard";
import { MapCard } from "@repo/design_system/app/organisms/cards/MapCard";

// Charts (ApexCharts)
import { Stacked } from "@repo/design_system/app/atoms/charts/apex/Stacked";
import { Line } from "@repo/design_system/app/atoms/charts/apex/Line";
import { Pie } from "@repo/design_system/app/atoms/charts/apex/Pie";

// Popups
import { DateRange } from "@repo/design_system/app/organisms/popups/DateRange";
import { LabDialog } from "@repo/design_system/app/organisms/popups/LabDialog";
import { FacilitiesPopup } from "@repo/design_system/app/organisms/popups/FacilitiesPopup";
```

### MainCard Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Report title |
| `subtitle` | `string` | Dynamic subtitle |
| `reportType` | `"national" \| "lab" \| "facility"` | Determines dialog type |
| `labType` | `"conventional" \| "poc"` | Laboratory type filter |
| `loading` | `boolean` | Shows loading overlay |
| `chartId` | `string` | ID for chart export |
| `additionalOptions` | `MainCardHeaderOptions[]` | Menu options |
| `handleSubmit` | `function` | Filter submission callback |
| `user` | `{ name, email }` | Current user info |

### Stacked Chart Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Required for export |
| `labels` | `string[]` | X-axis labels |
| `series` | `Array<{ name, data }>` | Chart data series |
| `height` | `number \| string` | Chart height |
| `onClick` | `(label: string) => void` | Click handler for drill-down |
| `colors` | `string[]` | Custom colors |

### App-Specific Components

```typescript
// Tabs (Shadcn)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Patient Dialog
import { PatientsDataDialog } from "@/components/patients-data-dialog";
```

---

## API Integration

### API Configuration

```typescript
// config/api.ts
import axios from "axios";

export const api = (token: string) => axios.create({
  baseURL: process.env.NEXT_PUBLIC_OPENLDR_API,
  timeout: 60000,
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});
```

### Available Endpoints

Base URL: `${NEXT_PUBLIC_OPENLDR_API}/tb/gx/laboratories/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `registered_samples_by_month/` | GET | Monthly registered samples |
| `registered_samples_by_lab/` | GET | Registered samples by lab |
| `rejected_samples_by_month/` | GET | Monthly rejected samples |
| `rejected_samples_by_lab/` | GET | Rejected samples by lab |
| `rejected_samples_by_reason/` | GET | Rejection reasons breakdown |

### Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `interval_dates` | `string` | `"2024-01-01,2024-12-31"` | Date range |
| `genexpert_result_type` | `string` | `"Ultra 6 Cores"` | Test type |
| `disaggregation` | `string` | `"True"` or `"False"` | Enable breakdown |
| `province` | `string[]` | `["Maputo"]` | Province filter |
| `district` | `string[]` | `["Matola"]` | District filter |
| `health_facility` | `string` | `"Hospital Central"` | Facility filter |

### API Response Types

```typescript
type Data = {
  Month?: number;
  Month_Name?: string;
  Year?: number;
  Resgistered_Samples: number;    // Note: API typo
  Rejected_Samples?: number;
  Start_Date: string;
  End_Date: string;
  Type_Of_Result: string;         // "Ultra 6 Cores" | "XDR 10 Cores"
  Lab_Type: string;               // "Conventional" | "Point_Of_Care"
  Testing_Facility?: string;
  Rejection_Reason?: string;
};
```

---

## Authentication

### Clerk Integration

The app uses Clerk for authentication. The middleware protects all routes except public ones.

```typescript
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Using Auth in Components

```typescript
import { useAuth, useUser } from "@clerk/nextjs";

export default function Component() {
  const { user } = useUser();           // User info
  const { getToken } = useAuth();       // Get JWT token

  const fetchData = async () => {
    const token = await getToken();     // Use for API calls
    const response = await api(token).get('/endpoint');
  };
}
```

---

## Environment Variables

Create `.env.local` in the app root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# OpenLDR API
NEXT_PUBLIC_OPENLDR_API=https://dev.openldr.org.mz

# Email Service (Resend)
RESEND_API_KEY=re_...
SUGGESTION_EMAILS=email1@example.com,email2@example.com
DASHBOARD_EMAIL=dashboard@openldr.org.mz
```

---

## Development

### Running the App

```bash
# From monorepo root
pnpm dev

# Or from apps/tb
cd apps/tb && pnpm dev
```

### Building

```bash
# From monorepo root
pnpm build

# Just the TB app
pnpm --filter tb build
```

### Type Checking

```bash
pnpm check-types
```

---

## Key Patterns

### State Management Pattern

Reports use local state with a grouped `reportState` object:

```typescript
const [reportState, setReportState] = useState<ReportState>({
  data: [],
  loading: true,
  error: null,
  activeTab: "ultra",
  timeInterval: { startDate: "...", endDate: "..." },
  facilities: [],
  facilityType: "province",
  disaggregation: false,
});
```

### Facility Hierarchy Navigation

```
Province → District → Clinic → Patient Details
```

Clicking a chart bar triggers drill-down to the next level.

### Dynamic Subtitle Pattern

Shows current filters as breadcrumb:
```
"01 de janeiro de 2024 à 31 de dezembro de 2024 | Maputo → Matola → Hospital Central"
```

### Export Pattern

Multi-strategy fallback for PNG export:
1. ApexCharts native export
2. html2canvas with OKLCH color fix
3. Direct canvas conversion
4. SVG to canvas conversion

---

## Language

All user-facing text should be in **Portuguese**:

- Report titles: "Relatório de Amostras Registadas por mês"
- Button labels: "Exportar para Excel", "Reiniciar o relatorio"
- Error messages: "Ocorreu um erro"
- Date formatting: "01 de janeiro de 2024"

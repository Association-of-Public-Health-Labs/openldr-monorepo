"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { Search } from "lucide-react";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { periodLabel } from "@repo/design_system/lib/period";
import { Tabs, TabsContent } from "@repo/design_system/components/ui/tabs";
import { SegmentedTabsList, SegmentedTabsTrigger } from "@repo/design_system/components/ui/segmented-tabs";
import { Input } from "@repo/design_system/components/ui/input";
import { Button } from "@repo/design_system/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/design_system/components/ui/select";
import { PatientsAdvancedDataTable } from "../../../../../components/patients-advanced-data-table";
import { FacilityPicker } from "./facility-picker";
import { useAuth, useUser } from "@clerk/nextjs";

import {
  DEFAULTS,
  SEARCH_TABS,
  GENEXPERT_OPTIONS,
  SAMPLE_TYPE_OPTIONS,
  RESULT_TYPE_OPTIONS,
} from "./constants";
import {
  SearchMode,
  TimeInterval,
  PatientRecord,
  SearchFilters,
  fetchPatients,
  fetchAllPatients,
  validateFilters,
  formatDatePt,
  exportPatientsToExcel,
} from "./actions";

// ============================================================================
// TYPES
// ============================================================================

interface SearchState {
  activeTab: SearchMode;
  data: PatientRecord[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  timeInterval: TimeInterval;
  pagination: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
  filters: SearchFilters;
  /** The search behind the table, which the export repeats over every page. */
  lastSearch: { mode: SearchMode; filters: SearchFilters; timeInterval: TimeInterval } | null;
}

// Remembered per browser, so a demo stays anonymised across reloads.
const HIDE_NAMES_KEY = "tb.patients.hideNames";

// ============================================================================
// COMPONENT
// ============================================================================

export default function PatientsResultsData() {
  const { user } = useUser();
  const { getToken } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================

  const [state, setState] = useState<SearchState>({
    activeTab: DEFAULTS.SEARCH_MODE,
    data: [],
    loading: false,
    error: null,
    hasSearched: false,
    timeInterval: DEFAULTS.TIME_INTERVAL,
    pagination: {
      page: 1,
      perPage: DEFAULTS.PER_PAGE,
      totalCount: 0,
      totalPages: 0,
    },
    filters: {
      healthFacility: "",
      firstName: "",
      surname: "",
      sampleType: "",
      resultType: "",
      genexpertResultType: DEFAULTS.GENEXPERT_RESULT_TYPE,
    },
    lastSearch: null,
  });
  const [exporting, setExporting] = useState(false);
  const [restartCount, setRestartCount] = useState(0);
  const [hideNames, setHideNames] = useState(false);

  useEffect(() => {
    try {
      setHideNames(localStorage.getItem(HIDE_NAMES_KEY) === "1");
    } catch {
      // No storage (private window): names start visible.
    }
  }, []);

  const handleHideNamesChange = useCallback((hide: boolean) => {
    setHideNames(hide);
    try {
      localStorage.setItem(HIDE_NAMES_KEY, hide ? "1" : "0");
    } catch {
      // Not remembered; the toggle still works.
    }
  }, []);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const dynamicSubtitle = useMemo(() => {
    const { startDate, endDate } = state.timeInterval;
    const dateRange = periodLabel(startDate, endDate, (s, e) => `${formatDatePt(s)} à ${formatDatePt(e)}`);

    if (!state.hasSearched) return dateRange;

    const tabPrefix =
      SEARCH_TABS.find((t) => t.value === state.activeTab)?.subtitlePrefix || "";
    let filterInfo = tabPrefix;

    switch (state.activeTab) {
      case "facility":
        if (state.filters.healthFacility)
          filterInfo += `: ${state.filters.healthFacility}`;
        break;
      case "name": {
        const names = [state.filters.firstName, state.filters.surname]
          .filter(Boolean)
          .join(" ");
        if (names) filterInfo += `: ${names}`;
        break;
      }
      case "sample_type": {
        const opt = SAMPLE_TYPE_OPTIONS.find(
          (o) => o.value === state.filters.sampleType
        );
        if (opt) filterInfo += `: ${opt.label}`;
        break;
      }
      case "result_type": {
        const opt = RESULT_TYPE_OPTIONS.find(
          (o) => o.value === state.filters.resultType
        );
        if (opt) filterInfo += `: ${opt.label}`;
        break;
      }
    }

    return `${dateRange} | ${filterInfo}`;
  }, [state.timeInterval, state.hasSearched, state.activeTab, state.filters]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const doSearch = useCallback(
    async (page: number, perPage: number) => {
      const validationError = validateFilters(state.activeTab, state.filters);
      if (validationError) {
        setState((prev) => ({ ...prev, error: validationError }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        hasSearched: true,
      }));

      try {
        const token = await getToken();
        const result = await fetchPatients(
          state.activeTab,
          state.filters,
          state.timeInterval,
          page,
          perPage,
          token as string
        );

        setState((prev) => ({
          ...prev,
          data: result.data,
          loading: false,
          pagination: {
            page: result.page,
            perPage: result.per_page,
            totalCount: result.total_count,
            totalPages: result.total_pages,
          },
          lastSearch: { mode: state.activeTab, filters: state.filters, timeInterval: state.timeInterval },
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Ocorreu um erro.";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          data: [],
          pagination: { ...prev.pagination, totalCount: 0, totalPages: 0 },
        }));
      }
    },
    [state.activeTab, state.filters, state.timeInterval, getToken]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSearch = useCallback(() => {
    doSearch(1, state.pagination.perPage);
  }, [doSearch, state.pagination.perPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      doSearch(page, state.pagination.perPage);
    },
    [doSearch, state.pagination.perPage]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setState((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, perPage: size },
      }));
      doSearch(1, size);
    },
    [doSearch]
  );

  const handleTabChange = useCallback((newTab: string) => {
    setState((prev) => ({
      ...prev,
      activeTab: newTab as SearchMode,
      data: [],
      error: null,
      hasSearched: false,
      pagination: { page: 1, perPage: prev.pagination.perPage, totalCount: 0, totalPages: 0 },
    }));
  }, []);

  const handleFilterChange = useCallback(
    (field: keyof SearchFilters, value: string) => {
      setState((prev) => ({
        ...prev,
        filters: { ...prev.filters, [field]: value },
        error: null,
      }));
    },
    []
  );

  const handleRestart = useCallback(() => {
    setState({
      activeTab: DEFAULTS.SEARCH_MODE,
      data: [],
      loading: false,
      error: null,
      hasSearched: false,
      timeInterval: DEFAULTS.TIME_INTERVAL,
      pagination: {
        page: 1,
        perPage: DEFAULTS.PER_PAGE,
        totalCount: 0,
        totalPages: 0,
      },
      filters: {
        healthFacility: "",
        firstName: "",
        surname: "",
        sampleType: "",
        resultType: "",
        genexpertResultType: DEFAULTS.GENEXPERT_RESULT_TYPE,
      },
      lastSearch: null,
    });
    setRestartCount((n) => n + 1);
  }, []);

  // Every page of the last search, not only the one on screen.
  const handleExportToExcel = useCallback(async () => {
    const search = state.lastSearch;
    if (!search || state.pagination.totalCount === 0) return;
    setExporting(true);
    try {
      const token = await getToken();
      const records = await fetchAllPatients(search.mode, search.filters, search.timeInterval, token as string);
      exportPatientsToExcel(records, DEFAULTS.REPORT_NAME, hideNames);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro.";
      setState((prev) => ({ ...prev, error: `Não foi possível exportar: ${message}` }));
    } finally {
      setExporting(false);
    }
  }, [state.lastSearch, state.pagination.totalCount, getToken, hideNames]);

  const handleSubmit = useCallback(
    (dates: string[]) => {
      setState((prev) => ({
        ...prev,
        timeInterval: { startDate: dates[0], endDate: dates[1] },
      }));
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  // ============================================================================
  // MEMOIZED VALUES (after handlers)
  // ============================================================================

  const mainCardOptions = useMemo(
    () => [
      {
        action: handleExportToExcel,
        icon: <PiMicrosoftExcelLogoFill size={20} />,
        label: "Exportar para Excel",
        type: "primary" as const,
      },
      {
        action: handleRestart,
        icon: <VscDebugRestart size={20} />,
        label: "Reiniciar pesquisa",
        type: "primary" as const,
      },
    ],
    [handleExportToExcel, handleRestart]
  );

  // ============================================================================
  // FILTER RENDERERS
  // ============================================================================

  const renderFacilityFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <FacilityPicker
        value={state.filters.healthFacility}
        onChange={(v) => handleFilterChange("healthFacility", v)}
      />
      <Select
        value={state.filters.genexpertResultType}
        onValueChange={(v) => handleFilterChange("genexpertResultType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="GeneXpert" />
        </SelectTrigger>
        <SelectContent>
          {GENEXPERT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="gap-2">
        <Search className="w-4 h-4" /> Pesquisar
      </Button>
    </div>
  );

  const renderNameFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        placeholder="Primeiro Nome..."
        value={state.filters.firstName}
        onChange={(e) => handleFilterChange("firstName", e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[150px]"
      />
      <Input
        placeholder="Apelido..."
        value={state.filters.surname}
        onChange={(e) => handleFilterChange("surname", e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[150px]"
      />
      <Select
        value={state.filters.genexpertResultType}
        onValueChange={(v) => handleFilterChange("genexpertResultType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="GeneXpert" />
        </SelectTrigger>
        <SelectContent>
          {GENEXPERT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="gap-2">
        <Search className="w-4 h-4" /> Pesquisar
      </Button>
    </div>
  );

  const renderSampleTypeFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={state.filters.sampleType}
        onValueChange={(v) => handleFilterChange("sampleType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo de Amostra" />
        </SelectTrigger>
        <SelectContent>
          {SAMPLE_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FacilityPicker
        optional
        value={state.filters.healthFacility}
        onChange={(v) => handleFilterChange("healthFacility", v)}
      />
      <Select
        value={state.filters.genexpertResultType}
        onValueChange={(v) => handleFilterChange("genexpertResultType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="GeneXpert" />
        </SelectTrigger>
        <SelectContent>
          {GENEXPERT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="gap-2">
        <Search className="w-4 h-4" /> Pesquisar
      </Button>
    </div>
  );

  const renderResultTypeFilters = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={state.filters.resultType}
        onValueChange={(v) => handleFilterChange("resultType", v)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de Resultado" />
        </SelectTrigger>
        <SelectContent>
          {RESULT_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FacilityPicker
        optional
        value={state.filters.healthFacility}
        onChange={(v) => handleFilterChange("healthFacility", v)}
      />
      <Select
        value={state.filters.genexpertResultType}
        onValueChange={(v) => handleFilterChange("genexpertResultType", v)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="GeneXpert" />
        </SelectTrigger>
        <SelectContent>
          {GENEXPERT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="gap-2">
        <Search className="w-4 h-4" /> Pesquisar
      </Button>
    </div>
  );

  const filterRenderers: Record<SearchMode, () => React.ReactNode> = {
    facility: renderFacilityFilters,
    name: renderNameFilters,
    sample_type: renderSampleTypeFilters,
    result_type: renderResultTypeFilters,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <MainCard
      additionalOptions={mainCardOptions}
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      loading={state.loading || exporting}
      reportType="national"
      subtitle={dynamicSubtitle}
      title={DEFAULTS.REPORT_NAME}
      user={{
        email: user?.emailAddresses[0]?.emailAddress || "",
        name: user?.fullName || "",
      }}
      width="100%"
      handleSubmit={handleSubmit as any}
    >
      <div className="px-4 pb-4">
        <Tabs
          key={restartCount}
          value={state.activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <SegmentedTabsList>
            {SEARCH_TABS.map((tab) => (
              <SegmentedTabsTrigger
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </SegmentedTabsTrigger>
            ))}
          </SegmentedTabsList>

          {SEARCH_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="rounded-lg border bg-card p-3 mb-4">
                {filterRenderers[tab.value]()}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Error message */}
        {state.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 mb-4 text-sm text-red-400">
            {state.error}
          </div>
        )}

        {/* Empty state */}
        {!state.hasSearched && !state.loading && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">
              Selecione um método de pesquisa e preencha os filtros para
              pesquisar pacientes.
            </p>
          </div>
        )}

        {/* Results table */}
        {state.hasSearched && !state.error && (
          <PatientsAdvancedDataTable
            data={state.data}
            totalCount={state.pagination.totalCount}
            totalPages={state.pagination.totalPages}
            currentPage={state.pagination.page}
            pageSize={state.pagination.perPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            hideNames={hideNames}
            onHideNamesChange={handleHideNamesChange}
          />
        )}
      </div>
    </MainCard>
  );
}

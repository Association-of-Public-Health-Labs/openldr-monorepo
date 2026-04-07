"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { BarGroup } from "@repo/design_system/app/atoms/charts/apex/BarGroup";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "../../../../../components/ui/select";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { CHART_CONFIG, DEFAULT_DRUG, DEFAULT_FACILITY_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT } from "./constants";
import { 
  FacilityType,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData
} from "./actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "../../../../../config/api";
import { exportChart } from "../shared/chart-export-utils";
import Docs from "./docs";

// Main component
export default function MTBTestedSamplesDisaggregatedByDrugByAge() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const reportName = "Relatório de Sensibilidade aos Medicamentos por Idade";
  
  // State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [facilities, setFacilities] = useState<FacilityOptions[]>([]);
  const [facilityType, setFacilityType] = useState<FacilityType>(DEFAULT_FACILITY_TYPE);
  const [disaggregation, setDisaggregation] = useState(false);
  const [drug, setDrug] = useState<string>(DEFAULT_DRUG);

  // Dynamic subtitle with formatted dates
  const dynamicSubtitle = useMemo(() => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    };

    const formattedStartDate = formatDate(timeInterval.startDate);
    const formattedEndDate = formatDate(timeInterval.endDate);
    const dateRange = `${formattedStartDate} à ${formattedEndDate}`;

    // Add facility context when facilities are selected
    if (facilities.length === 0) {
      return dateRange;
    }

    // Build hierarchy string based on available facility levels
    const buildFacilityHierarchy = (facility: FacilityOptions) => {
      const hierarchy = [];
      
      if (facility.province) {
        hierarchy.push(facility.province);
      }
      
      if (facility.district) {
        hierarchy.push(facility.district);
      }
      
      if (facility.clinic) {
        hierarchy.push(facility.clinic);
      }
      
      return hierarchy.join(' → ');
    };

    const facilityLabels = facilities.map(buildFacilityHierarchy);
    const labelsText = facilityLabels.join(' | ');
    return `${dateRange} | ${labelsText}`;
  }, [timeInterval, facilities]);

  const fetchDataFromApi = useCallback(async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    drug: string,
    facilities: FacilityOptions[],
    facilityType: FacilityType
  ) => {
    try {
      setLoading(true);
      const token = await getToken();
      const params = buildApiParams(
        { startDate, endDate },
        facilities,
        facilityType,
        disaggregation,
        drug
      );

      const response = await api(token).get(ENDPOINT, {
        params,
        paramsSerializer: { indexes: null }
      });

      if (response.data?.length > 0) {
        setData(response.data);
        setError(null);
      }
    } catch (error: any) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error ? error.message : "An error occurred";
      
      console.error("Error fetching data:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Effects
  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, disaggregation, drug, facilities, facilityType);
  }, [timeInterval, disaggregation, drug, facilities, facilityType, fetchDataFromApi]);

  // Event handlers
  const handleRestart = useCallback(() => {
    setDisaggregation(false);
    setFacilities([]);
    setFacilityType(DEFAULT_FACILITY_TYPE);
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, false, drug, [], DEFAULT_FACILITY_TYPE);
  }, [timeInterval, drug, fetchDataFromApi]);

  const handleSubmit = useCallback((dates: string[], facilities: FacilityOptions[], facilityType: FacilityType) => {
    setFacilities(facilities);
    setFacilityType(facilityType);
    setTimeInterval({ startDate: dates[0], endDate: dates[1] });
    setDisaggregation(false);
  }, []);

  const handleExportToExcel = useCallback(async () => {
    try {
      // Simple Excel export using the same pattern as other components
      const { utils, writeFile } = await import('xlsx');
      
      const chartData = prepareChartData(data, drug);
      const worksheetData = [
        [reportName], // Title row
        [`Medicamento: ${drug}`], // Drug information row
        [`Unidade: ${facilities.map(f => f.clinic).join(', ')}`]
        [''], // Empty row for spacing
        ['Faixas etárias', ...chartData.series.map(s => s.name)],
        ...chartData.labels.map((label, index) => [
          label,
          ...chartData.series.map(s => s.data[index] || 0)
        ]),        
      ];

      const worksheet = utils.aoa_to_sheet(worksheetData);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, 'Faixas etárias');
      
      const fileName = `${reportName}_${dynamicSubtitle}.xlsx`;
      writeFile(workbook, fileName);
    } catch (error) {
      console.error("Failed to export to Excel:", error);
    }
  }, [data, drug, reportName, dynamicSubtitle, facilities]);

  const handleExportToImage = useCallback(async () => {
    try {
      const fileName = `${reportName}_${dynamicSubtitle}`;
      await exportChart({
        chartId: "mtb-drug-age-chart",
        fileName: fileName
      });
    } catch (error) {
      console.error("Failed to export chart:", error);
    }
  }, [reportName, dynamicSubtitle]);

  // Memoized main card options
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

  // Data preparation
  const { labels, series } = prepareChartData(data, drug);

  return (
    <MainCard
      additionalOptions={mainCardOptions}
      chartId={CHART_CONFIG.CHART_ID}
      documentation={<Docs />}
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="facility"
      subtitle={dynamicSubtitle}
      title={reportName}
      user={{
        email: user?.emailAddresses[0].emailAddress,
        name: user?.fullName || ""
      }}
      width="100%"
      handleSubmit={handleSubmit as any}
      footerComponent={
        <Select value={drug} onValueChange={(value) => setDrug(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Medicamentos</SelectLabel>
              <SelectItem value="Rifampicin">Rifampicina</SelectItem>
              <SelectItem value="Amikacina">Amikacina</SelectItem>
              <SelectItem value="Capreomicin">Capreomicina</SelectItem>
              <SelectItem value="Ethionamida">Ethionamida</SelectItem>
              <SelectItem value="Kanamicin">Kanamicina</SelectItem>
              <SelectItem value="Isoniazid">Isoniazida</SelectItem>
              <SelectItem value="Fluoroquinolona">Fluoroquinolona</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      }
    >
      <BarGroup
        height={350}
        id="mtb-drug-age-chart"
        labels={labels}
        onClick={() => {}}
        series={series}
        width={"100%"}
      />
    </MainCard>
  );
}
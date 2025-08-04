"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { BarGroup } from "@repo/design_system/app/atoms/charts/apex/BarGroup";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
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
import { DEFAULT_DRUG, DEFAULT_FACILITY_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT } from "./constants";
import { 
  FacilityType,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData
} from "./actions";

const createMainCardOptions = (
  onRestart: () => void
) => [
  {
    action: () => {},
    icon: <PiMicrosoftExcelLogoFill size={20} />,
    label: "Exportar para Excel",
    type: "primary" as const
  },
  {
    action: () => {},
    icon: <IoImageOutline size={20} />,
    label: "Exportar imagem",
    type: "primary" as const
  },
  {
    action: onRestart,
    icon: <VscDebugRestart size={20} />,
    label: "Reiniciar o relatorio",
    type: "primary" as const
  },
  {
    action: () => {},
    icon: <HiOutlineDocumentText size={20} />,
    label: "Ver a Documentação",
    type: "secondary" as const
  },
];

// Main component
export default function MTBTestedSamplesDisaggregatedByDrug() {
  const reportName = "Relatorio Xpert MTB/XDR RIF Resistente";
  // State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [facilities, setFacilities] = useState<FacilityOptions[]>([]);
  const [facilityType, setFacilityType] = useState<FacilityType>(DEFAULT_FACILITY_TYPE);
  const [disaggregation, setDisaggregation] = useState(false);
  const [drug, setDrug] = useState<string>(DEFAULT_DRUG);

  const fetchDataFromApi = async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    drug: string
  ) => {
    try {
      setLoading(true);

      const params = buildApiParams(
        { startDate, endDate },
        facilities,
        facilityType,
        disaggregation,
        drug
      );

      const response = await axios.get(ENDPOINT, {
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
  };

  // Effects
  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, disaggregation, drug);
  }, [timeInterval, disaggregation, drug]);

  // Event handlers
  const handleRestart = () => {
    setDisaggregation(false);
    setFacilities([]);
    setFacilityType(DEFAULT_FACILITY_TYPE);
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, false, drug);
  };

  const handleSubmit = (dates: string[], facilities: FacilityOptions[], facilityType: FacilityType) => {
    setFacilities(facilities);
    setFacilityType(facilityType);
    setTimeInterval({ startDate: dates[0], endDate: dates[1] });
    setDisaggregation(facilityType === "district" || facilityType === "clinic");
  };

  // Data preparation
  const { labels, series } = prepareChartData(data, drug);

  return (
    <MainCard
      additionalOptions={createMainCardOptions(handleRestart)}
      chartId="tb-stacked-chart"
      headerProps={{ sx: { padding: 2 } }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="facility"
      subtitle="Últimos 12 meses"
      title={reportName}
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
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
              <SelectLabel>Drogas</SelectLabel>
              <SelectItem value="Rifampicin">Rifampicina</SelectItem>
              <SelectItem value="Amikacina">Amikacina</SelectItem>
              <SelectItem value="Capreomicin">Capreomicina</SelectItem>
              <SelectItem value="Ethionamida">Ethionamida</SelectItem>
              <SelectItem value="Kanamicin">Kanamicina</SelectItem>
              <SelectItem value="Amoxicilina">Amoxicilina</SelectItem>
              <SelectItem value="Isoniazid">Isoniazida</SelectItem>
              <SelectItem value="Fluoroquinolona">Fluoroquinolona</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      }
    >
      <BarGroup
        height={350}
        id="example-bar-group"
        labels={labels}
        onClick={() => {}}
        series={series}
        width={"100%"}
      />
    </MainCard>
  );
}
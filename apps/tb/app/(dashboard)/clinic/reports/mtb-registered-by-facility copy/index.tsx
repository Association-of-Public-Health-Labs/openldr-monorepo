"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { Stacked } from "@repo/design_system/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { DEFAULT_FACILITY_TYPE, DEFAULT_TIME_INTERVAL, ENDPOINT } from "./constants";
import { 
  FacilityType,
  getReportName,
  FacilityOptions,
  ActiveTab,
  Data,
  buildApiParams, 
  prepareChartData,
  fetchPatientData,
  getGenexpertResultType
} from "./actions";
import { PatientsDataDialog } from "../../../../../components/patients-data-dialog";

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
export default function MTBRegisteredByFacility() {
  // State
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ultra");
  const [timeInterval, setTimeInterval] = useState(DEFAULT_TIME_INTERVAL);
  const [facilities, setFacilities] = useState<FacilityOptions[]>([]);
  const [facilityType, setFacilityType] = useState<FacilityType>(DEFAULT_FACILITY_TYPE);
  const [disaggregation, setDisaggregation] = useState(false);
  const [openPatientsDataDialog, setOpenPatientsDataDialog] = useState(false);
  const [patientData, setPatientData] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // API call
  const fetchDataFromApi = async (
    startDate: string, 
    endDate: string, 
    disaggregation: boolean,
    facilities: FacilityOptions[],
    facilityType?: FacilityType
  ) => {
    try {
      setLoading(true);

      const params = buildApiParams(
        { startDate, endDate },
        activeTab,
        facilities,
        facilityType,
        disaggregation
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
    fetchDataFromApi(
      timeInterval.startDate, 
      timeInterval.endDate, 
      disaggregation, 
      facilities, 
      facilityType
    );
  }, [timeInterval, disaggregation, facilities, facilityType]);

  // Event handlers
  const handleRestart = () => {
    setDisaggregation(false);
    setFacilities([]);
    setFacilityType(DEFAULT_FACILITY_TYPE);
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, false, []);
  };

  const handleTabChange = (value: string) => {
    const newActiveTab = value as ActiveTab;
    setActiveTab(newActiveTab);
  };

  const handleChartClick = async (label: string) => {
    setLoading(true);
    if (!label) return;

    if(facilityType === "clinic") {
      setLoadingPatients(true);
      setOpenPatientsDataDialog(true);
      
      try {
        // Get the current facility data
        const currentFacility = facilities[0];
        
        const params = {
          interval_dates: `${timeInterval.startDate},${timeInterval.endDate}`,
          province: currentFacility?.province || "Zambezia",
          district: currentFacility?.district || "Quelimane", 
          health_facility: label, // Use the clicked facility name
          genexpert_result_type: getGenexpertResultType(activeTab),
        };
        
        console.log("Fetching patient data with params:", params);
        
        const patients = await fetchPatientData(params);
        console.log("Patient data received:", patients);
        
        setPatientData(patients);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        // Handle error (show toast, etc.)
        setPatientData([]);
      } finally {
        setLoadingPatients(false);
      }
      
      setLoading(false);
      return;
    }

    //If facilityType is province, set to district, if district, set to clinic, if clinic, set to patients, else set to province
    let newFacilityType: FacilityType = facilityType;

    if (facilityType === "province") {
      newFacilityType = "district";
    } else if (facilityType === "district") {
      newFacilityType = "clinic";
    } else {
      newFacilityType = "province";
    }
    
    setFacilityType(newFacilityType);

    const newFacility: FacilityOptions = {
      value: label,
      label,
      district: facilityType === "district" ? label : facilities[0]?.district || "",
      province: facilityType === "province" ? label : facilities[0]?.province || ""
    };

    setFacilities([newFacility]);
    setDisaggregation(true);

    await fetchDataFromApi(
      timeInterval.startDate, 
      timeInterval.endDate, 
      disaggregation, 
      facilities,
      newFacilityType
    );
    setLoading(false);
  };

  const handleSubmit = (dates: string[], facilities: FacilityOptions[], facilityType: FacilityType) => {
    setFacilities(facilities);
    setFacilityType(facilityType);
    setTimeInterval({ startDate: dates[0], endDate: dates[1] });
    setDisaggregation(facilityType === "district" || facilityType === "clinic");
  };

  const handleDialogClose = () => {
    setOpenPatientsDataDialog(false);
    setPatientData([]); // Clear the data when dialog is closed
  };

  // Data preparation
  const { labels, series } = prepareChartData(data);

  return (
    <>
      
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
        title={getReportName(activeTab)}
        user={{
          email: "john.doe@example.com",
          name: "John Doe"
        }}
        width="100%"
        handleSubmit={handleSubmit as any}
      >
        <Tabs 
          defaultValue="ultra" 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="mx-4 ml-auto">
            <TabsTrigger 
              value="ultra" 
              className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
            >
              Ultra
            </TabsTrigger>
            <TabsTrigger 
              value="xdr" 
              className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs"
            >
              XDR
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ultra" className="px-4 pb-4">
            <Stacked
              id="tb-stacked-chart"
              height={350}
              labels={labels}
              onClick={handleChartClick}
              series={series}
            />
          </TabsContent>
          
          <TabsContent value="xdr" className="px-4 pb-4">
            <Stacked
              id="tb-stacked-chart"
              height={350}
              labels={labels}
              onClick={() => {}}
              series={series}
            />
          </TabsContent>
        </Tabs>
      </MainCard>
      {openPatientsDataDialog && (
        <PatientsDataDialog
          data={patientData}
          open={openPatientsDataDialog}
          setOpen={handleDialogClose}
          loading={loadingPatients}
        />
      )}
    </>
  );
}
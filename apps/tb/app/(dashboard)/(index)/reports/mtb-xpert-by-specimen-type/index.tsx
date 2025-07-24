import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbMessage2Question } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";
import { Stacked } from "@repo/design_system/atoms/charts/apex/Stacked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import { prepareChartData, Data } from "./actions";

const endpoint = "https://api.openldr.org.mz/tb/gx/summary/sample_types_by_month/";
const baseReportName = "Relatório Xpert MTB Ultra por mês e tipo de amostra";

export function MTBXpertBySpecimenType() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");
  const [reportName, setReportName] = useState(baseReportName);
  const [timeInterval, setTimeInterval] = useState({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  });

  const fetchDataFromApi = async (startDate: string, endDate: string, activeTab: string) => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
          genexpert_result_type: activeTab === "ultra" ? "Ultra 6 Cores" : "XDR 10 Cores"
        },
      });

      if(response.data?.length > 0) {
        setData(response.data || []);
        return;
      }

      setError(null);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching data:", error.response?.data || error.message);
        setError(error.response?.data?.message || error.message || "An error occurred");
      } else {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, activeTab);
  }, [timeInterval, activeTab]);


  const { labels, series } = prepareChartData(data);

  return (
    <div>
      <MainCard
        additionalOptions={[
          {
            action: () => {},
            icon: <PiMicrosoftExcelLogoFill size={20} />,
            label: 'Exportar para Excel',
            type: 'primary'
          },
          {
            action: () => {},
            icon: <IoImageOutline size={20} />,
            label: 'Exportar imagem',
            type: 'primary'
          },
          {
            action: () => {},
            icon: <VscDebugRestart size={20} />,
            label: 'Reiniciar o relatorio',
            type: 'primary'
          },
          {
            action: () => {},
            icon: <HiOutlineDocumentText size={20} />,
            label: 'Ver a Documentação',
            type: 'secondary'
          },
          {
            action: () => {},
            icon: <TbMessage2Question size={20} />,
            label: 'Duvidas e Sugestões',
            type: 'secondary'
          }
        ]}
        chartId="default-chart"
        documentation={<div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
        headerProps={{
          sx: {
            padding: 2
          }
        }}
        height="auto"
        id="default-main-card"
        loading={loading}
        reportType="national"
        subtitle="Últimos 12 meses"
        title={reportName}
        user={{
          email: 'john.doe@example.com',
          name: 'John Doe'
        }}
        width="100%"
        handleSubmit={(values) => {
          setTimeInterval({
            startDate: values?.[0],
            endDate: values?.[1]
          });
        }}
      >
        <Tabs 
          defaultValue="ultra" 
          className="w-full"
          onValueChange={(value) => {
            setActiveTab(value as "ultra" | "xdr");
            setReportName(value === "ultra" ? 
              "Relatório Xpert MTB Ultra por faixa etária" : 
              "Relatório Xpert MTB XDR por faixa etária"
            );
          }}
        >
          <TabsList className="mx-4 ml-auto">
            <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
              Ultra
            </TabsTrigger>
            <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
              XDR
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ultra" className="px-4 pb-4">
            <Stacked
              id="tb-stacked-chart"
              height={350}
              labels={labels}
              onClick={() => {}}
              series={series}
              yLabel="Número de Casos"
            />
          </TabsContent>
          <TabsContent value="xdr" className="px-4 pb-4">
            <Stacked
              id="tb-stacked-chart"
              height={350}
              labels={labels}
              onClick={() => {}}
              series={series}
              yLabel="Número de Casos"
            />
          </TabsContent>
        </Tabs>
      </MainCard>
    </div>
  );
}
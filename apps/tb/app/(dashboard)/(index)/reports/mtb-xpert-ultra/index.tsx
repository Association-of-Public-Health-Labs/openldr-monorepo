"use client"
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { Stacked } from "@repo/design_system/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";

export type Data = {
  Analysed_Samples: number;
  Detected_Samples: number;
  End_Date: string;
  Errors: number;
  Invalid_Samples: number;
  Lab: string;
  Month: number;
  Month_Name: string;
  Not_Detected_Samples: number;
  Registered_Samples: number;
  Start_Date: string;
  Type_Of_Result: string;
  Year: number;
}

const endpoint = "https://api.openldr.org.mz/tb/gx/summary/positivity_by_month/";

export function MTBXpertUltra() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");
  const [timeInterval, setTimeInterval] = useState<{ startDate: string; endDate: string }>({ startDate: "2024-01-01", endDate: "2024-12-31" });
  const [reportName, setReportName] = useState<string>("Xpert MTB Ultra por mês");

  const params = {
    reportName: reportName,
    endpoint: endpoint,
    facilityType: "national",
    description: `
        Este relatório faz parte do painel de controle de Tuberculose (TB) e apresenta dados mensais sobre os resultados dos testes de TB realizados. O relatório inclui informações detalhadas sobre:
        - Número de casos onde MTB (Mycobacterium tuberculosis) foi detectado
        - Número de casos onde MTB não foi detectado
        - Casos com resultados inválidos
        - Casos sem resultados
        - Número de erros ocorridos
        - Total de testes realizados por mês
        
        Os dados são organizados cronologicamente por mês e ano, permitindo análise de tendências e padrões ao longo do tempo. Este relatório é fundamental para monitorar a eficácia dos testes de TB e identificar possíveis áreas que necessitam de melhorias no processo de diagnóstico.
      `,
    data: []
  }

  const { openChat } = useAIChat({
    reportName: reportName,
    endpoint: endpoint,
    facilityType: "national",
    description: `
        Este relatório faz parte do painel de controle de Tuberculose (TB) e apresenta dados mensais sobre os resultados dos testes de TB realizados. O relatório inclui informações detalhadas sobre:
        - Número de casos onde MTB (Mycobacterium tuberculosis) foi detectado
        - Número de casos onde MTB não foi detectado
        - Casos com resultados inválidos
        - Casos sem resultados
        - Número de erros ocorridos
        - Total de testes realizados por mês
        
        Os dados são organizados cronologicamente por mês e ano, permitindo análise de tendências e padrões ao longo do tempo. Este relatório é fundamental para monitorar a eficácia dos testes de TB e identificar possíveis áreas que necessitam de melhorias no processo de diagnóstico.
      `,
    data: []
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
  };

  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, activeTab);
  }, [timeInterval, activeTab]);

  const prepareChartData = () => {
    if (data.length === 0) return {
      labels: [],
      series: []
    };

    const labels = data?.map((item) => item?.Month_Name);
    const series = [
      {
        name: 'MTB Detectado',
        data: data?.map((item) => item?.Detected_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'MTB Não Detectado',
        data: data?.map((item) => item?.Not_Detected_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Inválido',
        data: data?.map((item) => item?.Invalid_Samples),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Erros',
        data: data?.map((item: any) => item?.Errors),
        group: 'apexcharts-axis-0'
      }
    ];

    return { labels, series };
  };

  const { labels, series } = prepareChartData();

  return (
    <MainCard
      additionalOptions={[
        {
          action: () => {},
          icon: <PiMicrosoftExcelLogoFill size={20} />,
          label: "Exportar para Excel",
          type: "primary"
        },
        {
          action: () => {},
          icon: <IoImageOutline size={20} />,
          label: "Exportar imagem",
          type: "primary"
        },
        {
          action: () => fetchDataFromApi(timeInterval.startDate, timeInterval.endDate, activeTab),
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
        {
          action: () => {},
          icon: <HiOutlineDocumentText size={20} />,
          label: "Ver a Documentação",
          type: "secondary"
        },
        {
          action: () => {openChat(params)},
          icon: <TbMessage2Question size={20} />,
          label: "Duvidas e Sugestões",
          type: "secondary"
        }
      ]}
      chartId="tb-stacked-chart"
      documentation={
        <div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
      headerProps={{
        sx: {
          padding: 2
        }
      }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      loading={loading}
      reportType="national"
      subtitle="Últimos 12 meses"
      title={reportName}
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
      }}
      width="100%"
      handleSubmit={(values) => {
        setTimeInterval({startDate: values?.[0], endDate: values?.[1]});
      }}
    >
      <Tabs 
        defaultValue="ultra" 
        className="w-full"
        onValueChange={(value) => {
          setActiveTab(value as "ultra" | "xdr");
          setReportName(value === "ultra" ? "Relatório Xpert MTB Ultra por mês" : "Relatório Xpert MTB XDR por mês");
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
  );
}
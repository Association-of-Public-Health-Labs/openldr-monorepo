"use client"
import { useEffect, useState } from "react";
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { Stacked } from "@repo/design_system/atoms/charts/apex/Stacked";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { prepareDataForExport, downloadCSV, formatDateForFilename } from "./excel-report";
import { CsvFileProps } from "@repo/design_system/contexts/CardContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";


const endpoint = "http://localhost:3001/api/test/facility";
const reportName = "Relatório de MTB Xpert Ultra por mês";

export function MTBXpertUltraFacilities() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState<{ startDate: string; endDate: string }>({ startDate: "2024-01-01", endDate: "2024-12-31" });
  const [csvFile, setCsvFile] = useState<CsvFileProps | undefined>();
  const [activeTab, setActiveTab] = useState<("ultra" | "xdr")>("ultra");

  const params = {
    reportName: reportName,
    endpoint: endpoint,
    facilityType: "province",
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
    facilityType: "province",
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

  const fetchDataFromApi = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      const url = new URL(endpoint);
      url.searchParams.append("start", startDate);
      url.searchParams.append("end", endDate);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate);
  }, [timeInterval]);

  const prepareChartData = () => {
    if (!data?.data) return {
      labels: [],
      series: []
    };

    const labels = data.data.map((item: any) => item.district);
    const series = [
      {
        name: 'MTB Detectado',
        data: data.data.map((item: any) => item.mtb_detected),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'MTB Não Detectado',
        data: data.data.map((item: any) => item.mtb_not_detected),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Inválido',
        data: data.data.map((item: any) => item.invalid),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Sem Resultado',
        data: data.data.map((item: any) => item.no_result),
        group: 'apexcharts-axis-0'
      },
      {
        name: 'Erros',
        data: data.data.map((item: any) => item.errors),
        group: 'apexcharts-axis-0'
      }
    ];

    return { labels, series };
  };

  // Update CSV file when data changes
  useEffect(() => {
    if (data?.data) {
      const csvFileData = prepareDataForExport(data.data, {
        filename: `relatorio-mtb-xpert-ultra-${formatDateForFilename(new Date())}.csv`
      });
      setCsvFile(csvFileData);
    }
  }, [data]);

  const handleExportToExcel = () => {
    if (csvFile) {
      downloadCSV(csvFile);
    }
  };

  const { labels, series } = prepareChartData();

  return (
    <MainCard
      additionalOptions={[
        {
          action: handleExportToExcel,
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
          action: () => fetchDataFromApi('2024-01-01', '2024-12-31'),
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
      documentation={<div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
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
        onValueChange={(value) => setActiveTab(value as "ultra" | "xdr")}
      >
        <TabsList className="mx-4 ml-auto">
          <TabsTrigger value="ultra" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            Ultra
          </TabsTrigger>
          <TabsTrigger value="xdr" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950">
            XDR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ultra" className="px-4 pb-4">
          <Stacked
            id="tb-stacked-chart"
            height={400}
            labels={labels}
            onClick={() => {}}
            series={series}
            yLabel="Número de Casos"
          />
        </TabsContent>
        <TabsContent value="xdr" className="px-4 pb-4">
         
        </TabsContent>
      </Tabs>
      {/* <div className="p-4">
        {error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <Stacked
            id="tb-stacked-chart"
            height={400}
            labels={labels}
            onClick={() => {}}
            series={series}
            yLabel="Número de Casos"
          />
        )}
      </div> */}
    </MainCard>
  );
}
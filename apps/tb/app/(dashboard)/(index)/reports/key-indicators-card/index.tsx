"use client"
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { KeyIndicatorsCard } from "@repo/design_system/app/organisms/cards/KeyIndicatorsCard";
import { useEffect, useState } from "react";
import axios from "axios";
import Docs from "./docs";
import { getLastTwelveMonths } from "./actions";
import { useAuth, useUser } from "@clerk/nextjs";

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

const endpoint = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/positivity_by_month/`;

export default function KeyIndicatorsReport() {
  const { getToken } = useAuth()
  const tabLabels = ["Todos", "Ultra", "XDR"];
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState(getLastTwelveMonths());
  const [activeTab, setActiveTab] = useState(tabLabels[0]);
  const { user } = useUser();

  const fetchDataFromApi = async (startDate: string, endDate: string, activeTab: string) => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
          ...(activeTab !== "Todos" && {genexpert_result_type: activeTab === "Ultra" ? "Ultra 6 Cores" : "XDR 10 Cores"})
        },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
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
    const result = [
      {
        Indicadores: "Amostras Registadas",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Registered_Samples;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        Indicadores: "Amostras Analizadas",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Analysed_Samples;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        Indicadores: "MTB Detetado",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Detected_Samples;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        Indicadores: "MTB Não Detetado",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Not_Detected_Samples;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        Indicadores: "Amostras Inválidas",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Invalid_Samples;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        Indicadores: "Erros",
        ...data?.reduce((acc, item) => {
          acc[item?.Month_Name] = item?.Errors;
          return acc;
        }, {} as Record<string, number>)
      }
    ];

    const columns = ["Indicadores", ...data?.map((item) => item?.Month_Name)];
    console.log("result...", result);

    return {
      result,
      columns
    };
  };

  const { result: chartData, columns } = prepareChartData();

  return (
    <MainCard
      user={{
        email: user?.emailAddresses[0]?.emailAddress,
        name: user?.fullName
      }}
      additionalOptions={[
        {
          action: () => {},
          icon: <PiMicrosoftExcelLogoFill size={20} />,
          label: "Exportar para Excel",
          type: "primary"
        },
        {
          action: () => {
            setTimeInterval(getLastTwelveMonths());
          },
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
      ]}
      chartId="tb-stacked-chart"
      documentation={<Docs />}
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
      title="Principais Indicadores das Amostras"
      width="100%"
      handleSubmit={(values) => {
        setTimeInterval({startDate: values?.[0], endDate: values?.[1]});
      }}
    >

      <KeyIndicatorsCard
        labels={tabLabels}
        onValueChange={(value) => {
          setActiveTab(value);
        }}
        columns={columns}
        containerProps={{
          sx: {
            margin: 'auto',
            maxWidth: '100%'
          }
        }}
        tab1={chartData}
        tab2={chartData}
        tab3={chartData}
      />
    </MainCard>
  );
}
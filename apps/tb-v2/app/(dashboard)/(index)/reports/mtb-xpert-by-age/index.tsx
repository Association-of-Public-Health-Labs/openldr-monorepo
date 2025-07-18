import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import axios from "axios";
import { useEffect, useState } from "react";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { TbMessage2Question } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";
import { prepareChartData } from "./actions";

type SpecimenProps = {
  sputum: number;
  feces: number;
  urine: number;
  blood: number;
  other: number;
}

export type Data = {
  Facility: string;
  "0_4": SpecimenProps,
  "5_9": SpecimenProps,
  "10_14": SpecimenProps,
  "15_19": SpecimenProps,
  "20_24": SpecimenProps,
  "25_29": SpecimenProps,
  "30_34": SpecimenProps,
  "35_39": SpecimenProps,
}

const endpoint = "https://api.openldr.org.mz/tb/gx/summary/sample_types_by_facility_by_age/";
const reportName = "Relatório de MTB Xpert Ultra por mês";

export function MTBXpertByAge() {
  const [data, setData] = useState<Data[]>([]);
  const [age, setAge] = useState<"0_4" | "5_9" | "10_14" | "15_19" | "20_24" | "25_29" | "30_34" | "35_39">("0_4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timeInterval, setTimeInterval] = useState({
    startDate: "2024-01-01",
    endDate: "2024-12-31"
  });

  const fetchDataFromApi = async () => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${timeInterval.startDate}, ${timeInterval.endDate}`,
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
      fetchDataFromApi();
    }, [timeInterval]
  );

  // const { labels, series } = prepareChartData();

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
        height="400px"
        id="default-main-card"
        labType="poc"
        loading={loading}
        reportType="lab"
        subtitle="This is the subtitle for the main card."
        title="Relatorio de Carga Viral"
        user={{
          email: 'john.doe@example.com',
          name: 'John Doe'
        }}
        width="100%"
      >
        <div
          style={{
            textAlign: 'center'
          }}
        >
        
        </div>
      </MainCard>
    </div>
  );
}
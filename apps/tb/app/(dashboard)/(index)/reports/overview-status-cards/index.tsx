import { SimpleLine } from "@repo/design_system/atoms/charts/apex/SimpleLine";
import axios from "axios";
import { useEffect, useState } from "react";

// {
//   "Registered_Samples_Ultra_6_Cores": 62657,
//   "Registered_Samples_XDR_10_Cores": 1304,
//   "Analyzed_Samples_Ultra_6_Cores": 62657,
//   "Analyzed_Samples_XDR_10_Cores": 1304,
//   "Detected_Samples_Ultra_6_Cores": 5235,
//   "Detected_Samples_XDR_10_Cores": 351,
//   "Not_Detected_Samples_Ultra_6_Cores": 43291,
//   "Not_Detected_Samples_XDR_10_Cores": 571,
//   "AVG_TRL_Days_Ultra_6_Cores": 9,
//   "AVG_TRL_Days_XDR_10_Cores": 2,
//   "Errors_Ultra_6_Cores": 1559,
//   "Errors_XDR_10_Cores": 22,
//   "Invalid_Ultra_6_Cores": 194,
//   "Invalid_XDR_10_Cores": 2,
//   "Type_Of_Result": "Ultra 6 Cores",
//   "Lab": "all",
//   "Start_Date": "2024-01-01",
//   "End_Date": "2025-01-01"
// }

export type Data = {
  Registered_Samples_Ultra_6_Cores: number;
  Registered_Samples_XDR_10_Cores: number;
  Analyzed_Samples_Ultra_6_Cores: number;
  Analyzed_Samples_XDR_10_Cores: number;
  Detected_Samples_Ultra_6_Cores: number;
  Detected_Samples_XDR_10_Cores: number;
  Not_Detected_Samples_Ultra_6_Cores: number;
  Not_Detected_Samples_XDR_10_Cores: number;
  AVG_TRL_Days_Ultra_6_Cores: number;
  AVG_TRL_Days_XDR_10_Cores: number;
  Errors_Ultra_6_Cores: number;
  Errors_XDR_10_Cores: number;
  Invalid_Ultra_6_Cores: number;
  Invalid_XDR_10_Cores: number;
  Type_Of_Result: string;
  Lab: string;
  Start_Date: string;
  End_Date: string;
}

const endpoint = "https://api.openldr.org.mz/tb/gx/summary/summary_header_component/";

export default function OverviewStatusCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data>();
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
        setData(response.data?.[0] || {});
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
  }, [timeInterval]);
  
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Amostras Testadas */}
      <section className="flex-1 flex flex-col gap-6 justify-between rounded-2xl bg-[#00B000]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Amostras Testadas</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#00B000]">{data?.Analyzed_Samples_Ultra_6_Cores}</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#00B000]">{data?.Analyzed_Samples_XDR_10_Cores}</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#00B000"]}
            />
          </div>
        </div>
      </section>

      {/* Positividade */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#C87102]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Positividade</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#C87102]">{data?.Detected_Samples_Ultra_6_Cores}</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#C87102]">{data?.Detected_Samples_XDR_10_Cores}</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Positividade", data: [5, 8, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0] }]}
              width={150}
              height={32}
              colors={["#C87102"]}
            />
          </div>
        </div>
      </section>

      {/* Tempo de Resposta */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#39298B]/6 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Tempo de Resposta</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#39298B]">{data?.AVG_TRL_Days_Ultra_6_Cores} dias</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#39298B]">{data?.AVG_TRL_Days_XDR_10_Cores} dias</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#39298B"]}
            />
          </div>
        </div>
      </section>

      {/* Erros / Inválidos */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#E10D09]/10 p-6 relative min-w-[220px]">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-lg">Erros</h2>
          <h2 className="font-bold text-lg">Inválidos</h2>
        </div>
        <div className="flex justify-between mb-2">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">ULTRA</div>
              <div className="font-bold text-[#E10D09]">{data?.Errors_Ultra_6_Cores}</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">XDR</div>
              <div className="font-bold text-[#E10D09]">{data?.Errors_XDR_10_Cores}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">ULTRA</div>
              <div className="font-bold text-[#E10D09]">{data?.Invalid_Ultra_6_Cores}</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">XDR</div>
              <div className="font-bold text-[#E10D09]">{data?.Invalid_XDR_10_Cores}</div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#E10D09"]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
import { SimpleLine } from "@repo/design_system/app/atoms/charts/apex/SimpleLine";
import axios from "axios";
import { useEffect, useState } from "react";
import { getLastTwelveMonths } from "./actions";

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

const endpoint = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/summary_header_component/`;

export default function OverviewStatusCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data>();
  const [timeInterval, setTimeInterval] = useState(getLastTwelveMonths());

  const fetchDataFromApi = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);

      const response = await axios.get(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
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
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate);
  }, [timeInterval]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4 @[1536px]:gap-8">
      {/* Amostras Testadas */}
      <section className="flex-1 flex flex-col gap-1 justify-between rounded-2xl bg-[#00B000]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-sm">Amostras Testadas</h2>
        <div className="flex justify-between">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#00B000]">{data?.Analyzed_Samples_Ultra_6_Cores}</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#00B000]">{data?.Analyzed_Samples_XDR_10_Cores}</div>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="text-xs whitespace-nowrap">Últimos 12 meses</div>
          <div className="h-8 flex-1 flex flex-row items-center justify-end">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={130}
              height={32}
              colors={["#00B000"]}
            />
          </div>
        </div>
      </section>

      {/* Positividade */}
      <section className="flex-1 flex flex-col gap-1 justify-between rounded-2xl bg-[#C87102]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-sm">Positividade</h2>
        <div className="flex justify-between">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#C87102]">{data?.Detected_Samples_Ultra_6_Cores}</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#C87102]">{data?.Detected_Samples_XDR_10_Cores}</div>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="text-xs whitespace-nowrap">Últimos 12 meses</div>
          <div className="h-8 flex-1 flex flex-row items-center justify-end">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Positividade", data: [5, 8, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0] }]}
              width={130}
              height={32}
              colors={["#C87102"]}
            />
          </div>
        </div>
      </section>

      {/* Tempo de Resposta */}
      <section className="flex-1 flex flex-col gap-1 justify-between rounded-2xl bg-[#39298B]/6 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-sm">Tempo de Resposta</h2>
        <div className="flex justify-between">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#39298B]">{data?.AVG_TRL_Days_Ultra_6_Cores} dias</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#39298B]">{data?.AVG_TRL_Days_XDR_10_Cores} dias</div>
          </div>
        </div>
        <div className="flex flex-row items-end justify-between">
          <div className="text-xs whitespace-nowrap">Últimos 12 meses</div>
          <div className="h-8 flex-1 flex flex-row items-center justify-end">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "TRL", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={130}
              height={32}
              colors={["#39298B"]}
            />
          </div>
        </div>
      </section>

      {/* Erros / Inválidos */}
      <section className="flex-1 flex flex-col gap-1 justify-between rounded-2xl bg-[#E10D09]/10 p-6 relative min-w-[220px]">
        <div className="flex justify-between items-start">
          <h2 className="font-bold text-sm">Erros</h2>
          <h2 className="font-bold text-sm">Inválidos</h2>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col items-start">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">ULTRA</div>
              <div className="font-bold text-[#E10D09]">{data?.Errors_Ultra_6_Cores}</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">XDR</div>
              <div className="font-bold text-[#E10D09]">{data?.Errors_XDR_10_Cores}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
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
        <div className="flex flex-row items-end justify-between">
          <div className="text-xs whitespace-nowrap">Últimos 12 meses</div>
          <div className="h-8 flex-1 flex flex-row items-center justify-end">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Erros", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={130}
              height={32}
              colors={["#E10D09"]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
import { formatNumber } from "@repo/design_system/lib/format-number";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getLastTwelveMonths } from "./actions";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../../config/api";

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

type ApiResponse =
  | Data[]
  | { data?: unknown; results?: unknown; items?: unknown; records?: unknown; detail?: unknown; message?: unknown };

const getApiErrorMessage = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const detail = value as { detail?: unknown; message?: unknown; error?: unknown };
    return getApiErrorMessage(detail.detail ?? detail.message ?? detail.error ?? JSON.stringify(value));
  }

  return "An error occurred";
};

const extractDataArray = (payload: ApiResponse): Data[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Resposta inválida da API: formato de dados inesperado.");
  }

  const apiError = payload.detail ?? payload.message;
  if (apiError) {
    throw new Error(getApiErrorMessage(apiError));
  }

  const candidate = payload.data ?? payload.results ?? payload.items ?? payload.records;
  if (Array.isArray(candidate)) {
    return candidate as Data[];
  }

  throw new Error("Resposta inválida da API: era esperado um array de indicadores de resumo.");
};

const calculatePercentage = (value: number | undefined, total: number | undefined): string => {
  if (!value || !total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

const endpoint = `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/summary_header_component/`;

export default function OverviewStatusCards() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data>();
  const [timeInterval, setTimeInterval] = useState(getLastTwelveMonths());
  const { getToken } = useAuth();
  
  const fetchDataFromApi = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);

      const token = await getToken();

      const response = await api(token).get<ApiResponse>(endpoint, {
        params: {
          interval_dates: `${startDate}, ${endDate}`,
        },
      });

      const responseData = extractDataArray(response.data);

      if(responseData.length > 0) {
        setData(responseData[0]);
        return;
      }

      setData(undefined);
      setError(null);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching data:", error.response?.data || error.message);
        setError(getApiErrorMessage(error.response?.data?.message ?? error.response?.data?.detail) || error.message || "An error occurred");
      } else {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
      setData(undefined);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchDataFromApi(timeInterval.startDate, timeInterval.endDate);
  }, [timeInterval, fetchDataFromApi]);
  
  const percentages = useMemo(() => ({
    errorsUltra: calculatePercentage(data?.Errors_Ultra_6_Cores, data?.Registered_Samples_Ultra_6_Cores),
    errorsXdr: calculatePercentage(data?.Errors_XDR_10_Cores, data?.Registered_Samples_XDR_10_Cores),
    invalidUltra: calculatePercentage(data?.Invalid_Ultra_6_Cores, data?.Registered_Samples_Ultra_6_Cores),
    invalidXdr: calculatePercentage(data?.Invalid_XDR_10_Cores, data?.Registered_Samples_XDR_10_Cores),
  }), [data]);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-6">
      {/* Amostras Testadas */}
      <section className="flex-1 flex flex-col gap-2 justify-between rounded-2xl bg-[#00B000]/10 p-4 sm:p-6 relative min-w-0 sm:min-w-[180px] lg:min-w-[200px] @container">
        <h2 className="font-bold text-xs sm:text-sm">Amostras Testadas</h2>
        <div className="flex flex-col @[180px]:flex-row @[180px]:justify-between gap-1 @[180px]:gap-2">
          <div className="flex flex-row justify-start items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">ULTRA</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#00B000]">{formatNumber(data?.Analyzed_Samples_Ultra_6_Cores)}</div>
          </div>
          <div className="flex flex-row justify-start @[180px]:justify-end items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">XDR</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#00B000]">{formatNumber(data?.Analyzed_Samples_XDR_10_Cores)}</div>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500">Últimos 12 meses</div>
      </section>

      {/* Positividade */}
      <section className="flex-1 flex flex-col gap-2 justify-between rounded-2xl bg-[#C87102]/10 p-4 sm:p-6 relative min-w-0 sm:min-w-[180px] lg:min-w-[200px] @container">
        <h2 className="font-bold text-xs sm:text-sm">Positividade</h2>
        <div className="flex flex-col @[180px]:flex-row @[180px]:justify-between gap-1 @[180px]:gap-2">
          <div className="flex flex-row justify-start items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">ULTRA</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#C87102]">{formatNumber(data?.Detected_Samples_Ultra_6_Cores)}</div>
          </div>
          <div className="flex flex-row justify-start @[180px]:justify-end items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">XDR</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#C87102]">{formatNumber(data?.Detected_Samples_XDR_10_Cores)}</div>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500">Últimos 12 meses</div>
      </section>

      {/* Tempo de Resposta */}
      <section className="flex-1 flex flex-col gap-2 justify-between rounded-2xl bg-[#39298B]/6 p-4 sm:p-6 relative min-w-0 sm:min-w-[180px] lg:min-w-[200px] @container">
        <h2 className="font-bold text-xs sm:text-sm">Tempo de Resposta</h2>
        <div className="flex flex-col @[180px]:flex-row @[180px]:justify-between gap-1 @[180px]:gap-2">
          <div className="flex flex-row justify-start items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">ULTRA</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#39298B]">{data?.AVG_TRL_Days_Ultra_6_Cores} dias</div>
          </div>
          <div className="flex flex-row justify-start @[180px]:justify-end items-center gap-1 sm:gap-2">
            <div className="font-bold text-xs sm:text-sm">XDR</div>
            <div className="font-bold tabular-nums text-xs sm:text-base text-[#39298B]">{data?.AVG_TRL_Days_XDR_10_Cores} dias</div>
          </div>
        </div>
        <div className="flex flex-col @[180px]:flex-row @[180px]:justify-between gap-1 @[180px]:gap-2">
          <div className="text-[10px] sm:text-xs text-gray-500">Últimos 12 meses</div>
          <div className="text-[10px] sm:text-xs text-gray-500">Intervalo esperado (24-48h)</div>
        </div>
      </section>

      {/* Erros / Inválidos */}
      <section className="flex-1 flex flex-col gap-2 justify-between rounded-2xl bg-[#E10D09]/10 p-4 sm:p-6 relative min-w-0 sm:min-w-[180px] lg:min-w-[200px] @container">
        <div className="flex justify-between items-start">
          <h2 className="font-bold text-xs sm:text-sm">Erros</h2>
          <h2 className="font-bold text-xs sm:text-sm">Inválidos</h2>
        </div>
        <div className="flex flex-col @[200px]:flex-row @[200px]:justify-between gap-2">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex flex-row justify-start items-center gap-1 sm:gap-2">
              <div className="font-bold text-xs sm:text-sm">ULTRA</div>
              <div className="font-bold tabular-nums text-xs sm:text-base text-[#E10D09]">
                {formatNumber(data?.Errors_Ultra_6_Cores)}
                <span className="text-[10px] sm:text-xs font-medium ml-0.5">({percentages.errorsUltra})</span>
              </div>
            </div>
            <div className="flex flex-row justify-start items-center gap-1 sm:gap-2">
              <div className="font-bold text-xs sm:text-sm">XDR</div>
              <div className="font-bold tabular-nums text-xs sm:text-base text-[#E10D09]">
                {formatNumber(data?.Errors_XDR_10_Cores)}
                <span className="text-[10px] sm:text-xs font-medium ml-0.5">({percentages.errorsXdr})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start @[200px]:items-end gap-0.5">
            <div className="flex flex-row justify-start @[200px]:justify-end items-center gap-1 sm:gap-2">
              <div className="font-bold text-xs sm:text-sm">ULTRA</div>
              <div className="font-bold tabular-nums text-xs sm:text-base text-[#E10D09]">
                {formatNumber(data?.Invalid_Ultra_6_Cores)}
                <span className="text-[10px] sm:text-xs font-medium ml-0.5">({percentages.invalidUltra})</span>
              </div>
            </div>
            <div className="flex flex-row justify-start @[200px]:justify-end items-center gap-1 sm:gap-2">
              <div className="font-bold text-xs sm:text-sm">XDR</div>
              <div className="font-bold tabular-nums text-xs sm:text-base text-[#E10D09]">
                {formatNumber(data?.Invalid_XDR_10_Cores)}
                <span className="text-[10px] sm:text-xs font-medium ml-0.5">({percentages.invalidXdr})</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500">Últimos 12 meses</div>
      </section>
    </div>
  );
}

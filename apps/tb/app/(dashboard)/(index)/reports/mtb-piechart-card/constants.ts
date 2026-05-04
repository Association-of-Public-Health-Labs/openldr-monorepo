import { getLastTwelveMonths } from "./actions";
import chartTheme from "../../../../../../../packages/design_system_mui/src/themes/charts";

// API Configuration
export const API_CONFIG = {
    BASE_URL: `${process.env.NEXT_PUBLIC_OPENLDR_API}/tb/gx/summary/positivity_by_month/`,
    TIMEOUT: 60000,
} as const;

// Default Values
export const DEFAULTS = {
    TIME_INTERVAL: getLastTwelveMonths(),
    ACTIVE_TAB: "ultra" as const,
    REPORT_NAME: "Relatório de Resultados",
} as const;

// Chart Configuration
export const CHART_CONFIG = {
    HEIGHT: 320,
    CHART_ID: "summary_positivity_pie_chart",
    COLORS: {
        ULTRA: {
            DETECTED: chartTheme.theme1[0],        // MTB detectado - Orange
            NOT_DETECTED: chartTheme.theme1[1],    // MTB não detectado - Teal
            INVALID: chartTheme.theme1[2],         // Inválidos - Dark blue
            ERRORS: chartTheme.theme1[3],          // Erros - Yellow
            NOT_ANALYSED: chartTheme.theme1[5],    // Não analisados - Orange variant
        },
        XDR: {
            DETECTED: chartTheme.theme1[0],        // MTB detectado - Orange
            NOT_DETECTED: chartTheme.theme1[1],    // MTB não detectado - Teal
            INVALID: chartTheme.theme1[2],         // Inválidos - Dark blue
            ERRORS: chartTheme.theme1[3],          // Erros - Yellow
            NOT_ANALYSED: chartTheme.theme1[5],    // Não analisados - Orange variant
        }
    },
    LABELS: {
        DETECTED: "Resultados Positivos",
        NOT_DETECTED: "Resultados Negativos",
        INVALID: "Inválidos",
        ERRORS: "Erros",
        NOT_ANALYSED: "Não Preenchido",
    }
} as const;

// Chart Configuration Type
export type ChartConfig = {
    HEIGHT: number;
    CHART_ID: string;
    COLORS: {
        ULTRA: {
            DETECTED: string;
            NOT_DETECTED: string;
            INVALID: string;
            ERRORS: string;
            NOT_ANALYSED: string;
        };
        XDR: {
            DETECTED: string;
            NOT_DETECTED: string;
            INVALID: string;
            ERRORS: string;
            NOT_ANALYSED: string;
        };
    };
    LABELS: {
        DETECTED: string;
        NOT_DETECTED: string;
        INVALID: string;
        ERRORS: string;
        NOT_ANALYSED: string;
    };
};

// UI Configuration
export const UI_CONFIG = {
    TAB_OPTIONS: [
        { value: "ultra", label: "Ultra" },
        { value: "xdr", label: "XDR" },
    ] as const,
    MAIN_CARD_OPTIONS: {
        HEIGHT: "auto",
        LAB_TYPE: "poc",
        REPORT_TYPE: "national",
        SUBTITLE: "Últimos 12 meses",
    } as const,
    EXPORT_OPTIONS: {
        EXCEL_LABEL: "Exportar para Excel",
        IMAGE_LABEL: "Exportar imagem",
        RESTART_LABEL: "Reiniciar o relatorio",
    } as const,
} as const;

// Active Tab Type
export type ActiveTab = "ultra" | "xdr";

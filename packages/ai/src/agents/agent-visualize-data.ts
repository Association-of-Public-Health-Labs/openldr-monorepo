import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";
import { generateObject } from "ai";
import { LanguageModelV1 } from "ai";
import { z } from "zod";
import { Stacked, schema as StackedSchema } from "@repo/design_system/atoms/charts/apex/Stacked";

// export async function execute({
//   query,
//   chartType,
//   chartId,
//   data,
// }: {
//   query: string;
//   chartType: string;
//   chartId: string;
//   data: any;
// }) {
  
//   const { object: timeInfo } = await generateObject({
//     model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,
//     schema: z.object({
//       chartType: z.string().describe("Tipo de gráfico a ser gerado"),
//       chartId: z.string().describe("ID do gráfico a ser gerado"),
//     }),
//     prompt: `
//       Você é um assistente de IA que gera gráficos a partir de dados.
//     `
//   })
// }

// Add data sampling functions
function sampleData(data: any[], maxPoints: number = 100) {
  if (data.length <= maxPoints) return data;
  
  const step = Math.floor(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
}

function aggregateData(data: any[], groupBy: string, aggregateFields: string[]) {
  const grouped = data.reduce((acc, item) => {
    const key = item[groupBy];
    if (!acc[key]) {
      acc[key] = { count: 0, ...aggregateFields.reduce((obj, field) => ({ ...obj, [field]: 0 }), {}) };
    }
    acc[key].count++;
    aggregateFields.forEach(field => {
      acc[key][field] += item[field] || 0;
    });
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(grouped).map(([key, values]) => ({ [groupBy]: key, ...(values as object) }));
}

// Update the execute function to handle large datasets
export async function execute({
  query,
  chartType,
  chartId,
  data,
}: {
  query: string;
  chartType: string;
  chartId: string;
  data: any;
}) {
  
  // Check data size and apply appropriate strategy
  const dataSize = Array.isArray(data) ? data.length : 0;
  let processedData = data;
  
  if (dataSize > 1000) {
    // For very large datasets, use sampling
    processedData = sampleData(data, 500);
  } else if (dataSize > 100) {
    // For medium datasets, use aggregation
    const firstItem = data[0];
    const timeFields = Object.keys(firstItem).filter(key => 
      key.includes('date') || key.includes('time') || key.includes('month') || key.includes('year')
    );
    
    if (timeFields.length > 0) {
      processedData = aggregateData(data, timeFields[0], 
        Object.keys(firstItem).filter(key => typeof firstItem[key] === 'number')
      );
    }
  }

  // Continue with the existing logic using processedData
  const { object: chartAnalysis } = await generateObject({
    model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,
    schema: z.object({
      associations: z.object(z.any())
    }),
    prompt: `
      Você é um assistente de IA especializado em análise de dados e visualização de gráficos.
      
      DADOS FORNECIDOS (${processedData.length} registos):
      ${JSON.stringify(processedData.slice(0, 2), null, 2)}
      ${processedData.length > 10 ? `... e mais ${processedData.length - 10} registros` : ''}
      QUERY DO USUÁRIO:
      ${query}
      
      TIPO DE GRÁFICO SOLICITADO: 
      ${chartType}

      SCHEMA DO GRÁFICO SOLICITADO:
      ${StackedSchema.describe}

      INSTRUÇÕES:
      1. Com base no schema de cada objecto dos DADOS FORNECIDOS, crie um objecto que relacione os campos do schema com o SCHEMA DO GRÁFICO SOLICITADO.
      
      Por exemplo, se o schema do gráfico solicitado é:
      {
        "labels": ["Janeiro", "Fevereiro", "Março"],
        "series": [
          { "name": "Total", "data": [100, 200, 300] }
        ]
      }

      e os dados fornecidos são:
      [
        {
          "id": 1,
          "trace": 124,
          "mtb_detected": 435,
          "mtb_not_detected": 100,
          "invalid": 24,
          "no_result": 160,
          "errors": 10,
          "total": 853,
          "month": "Janeiro",
          "year": 2024
        },
        ...
      ]

      então o objecto que relaciona os campos do schema com o SCHEMA DO GRÁFICO SOLICITADO é:
      {
        "associations": { 
          "labels": "month",
          "series": [
            { "trace": "Tracos de TB"},
            { "mtb_detected": "MTB Detetados"},
            { "mtb_not_detected": "MTB Não Detetados"},
            { "invalid": "Inválidos"},
            { "no_result": "Sem Resultado"},
            { "errors": "Erros"},
          ]
        }
      }
    `
  });

  

  // ... rest of the function
}
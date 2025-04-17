import { NextRequest, NextResponse } from "next/server";
import { 
  extractTheFacilityNamesInTheQuery, 
  FacilityType, 
  generateHealthcareDictCodes, 
  getDictionaryEndpoint, 
  getTimeInterval, 
  superviseDashboardReports 
} from "@/agents/supervisor";
import { z } from "zod";
import { streamText, createDataStreamResponse, generateObject } from "ai";
import { openai } from "@/config/openai";

const requestSchema = z.object({
  query: z.string(),
  endpoint: z.string(),
  facilityType: z.enum(["lab", "province", "district", "clinic", "national"])
});

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
    
//     // Validate request body
//     const { query, endpoint, facilityType } = requestSchema.parse(body);

//     const result = await superviseDashboardReports({
//       query,
//       endpoint,
//       facilityType
//     });

//     if (!result) {
//       return NextResponse.json(
//         { error: "No facilities found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error in supervise endpoint:", error);
    
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Invalid request parameters", details: error.issues },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// } 


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, endpoint, facilityType, agent } = body;

    console.log("messages", messages);

    const query = messages?.[messages.length - 1]?.content;
    if (!query) {
      throw new Error("Query not found");
    }
    let agentToRun;
    
    if(!agent) {
      const supervisorResponse = await supervise({query, endpoint, facilityType});
      agentToRun = supervisorResponse.agent;
    }
    else {
      agentToRun = agent || "agent-generic";
    }

    if(agentToRun === "agent-get-data-from-api") {
      const result = await runAgentGetDataFromApi({query, endpoint, facilityType});
      return result;
    }
    else if(agentToRun === "agent-analyze-data") {
      const result = await runAgentAnalyzeData({query, endpoint, facilityType});
      return result;
    }
    else if(agentToRun === "agent-generate-excel-report") {
      const result = await runAgentGenerateExcelReport({query, endpoint, facilityType});
      return result;
    }
    else {
      const result = await runAgentGeneric({query, endpoint, facilityType});
      return result;
    }
  } catch (error) {
    console.error("Error in supervise endpoint:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request parameters",
          details: error.issues
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}


export async function supervise({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: string}) {
  //classify the query to decide what to do
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      agent: z.enum(["agent-get-data-from-api", "agent-analyze-data", "agent-generate-excel-report", "agent-generic"]).describe("The agent to be used to answer the query"),
    }),
    prompt: `
      Tu es um assistente de IA usada na Dashboard de Dados de Carga Viral de HIV.
      Tu es um agente SUPERVISOR e tens a funcao de classificar a QUESTÃO colocada pelo cliente para alocar o agente correto para responder a QUESTÃO.

      A tua disposição tens os seguintes agentes:
      - AGENTE que obtem os dados da API: "agent-get-data-from-api"
      - AGENTE analisa os dados colocados pelo cliente: "agent-analyze-data"
      - AGENTE que gera a Planilha do relatório no formato Excel: "agent-generate-excel-report"
      - AGENTE generico que responde qualquer outra QUESTÃO que nao seja relacionada aos outros agentes: "agent-generic"
      
      "agent-get-data-from-api": 
        - Este agente e responsavel por obter os dados da API. Este e o reponsavel por qualquer QUESTÃO que esteja relacionada aos dados da API. 
        - Este agente deve ser preferencial sempre que o cliente perguntar pela primeira vez.
        - Exemplo de QUESTÃO para este agente: 
            ✅ Qual e a media da Supressao Viral em Maputo Cidade?
            ✅ Qual e o tempo de resposta Laboratorial de Gaza?
            ✅ Qual e o numero de amostras processadas em 2024 no Laboratorio do HC Nampula?
            ✅ Qual e o numero de amostras testadas em Namacura de Janeiro de 2023 a Junho de 2024?
      
      "agent-analyze-data": Este agente deve ser acionado sempre que o cliente enviar dados para que sejam analisados.
      "agent-generate-excel-report": 
        - Este agente deve ser acionado sempre que o cliente solicitar a geração de um relatório em formato Excel.
        - Exemplo de QUESTÃO para este agente:
            ✅ Crie um relatório no formato Excel

      "agent-generic": Este agente deve ser acionado para qualquer outra QUESTÃO que nao seja relacionada aos outros agentes.
      
      Todas as respostas devem ser na Lingua em que a QUESTÃO foi colocada pelo cliente.
      Sempre que a questao nao for clara, deve ser acionado o agente "agent-generic".
      
      QUESTÃO: ${query}
    `
  });

  return classification;
}

export async function runAgentGetDataFromApi({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {
  const dictEndpoint = getDictionaryEndpoint(facilityType);

  if (facilityType !== "national") {
    const [{ facilityNames }, timeInterval] = await Promise.all([
      extractTheFacilityNamesInTheQuery({ query }),
      getTimeInterval(query)
    ]);

    if (!facilityNames?.length && ["clinic", "province", "district"].includes(facilityType)) {
      return createDataStreamResponse({
        execute: async (dataStream) => {
          // Send trigger object
          dataStream.writeData({ 
            showFacilitiesSelector: true,
            timeInterval: {
              startDate: timeInterval.startDate,
              endDate: timeInterval.endDate
            }
          });

          // Stream response text to assistant
          const result = streamText({
            model: openai,
            messages: [
              {
                role: "assistant",
                content: "Por favor, selecione as unidades específicas para sua consulta:"
              }
            ]
          });

          result.mergeIntoDataStream(dataStream);
        }
      });
    }
    else if(facilityNames?.length && facilityType === "lab") {
      return createDataStreamResponse({
        execute: async (dataStream) => {
          // Send trigger object
          dataStream.writeData({ 
            showLabsSelector: true 
          });

          // Stream response text to assistant
          const result = streamText({
            model: openai,
            messages: [
              {
                role: "assistant",
                content: "Por favor, selecione o laboratórios para sua consulta:"
              }
            ]
          });

          result.mergeIntoDataStream(dataStream);
        }
      });
    }

    const facilityCodes = await generateHealthcareDictCodes({
      query,
      endpoint: dictEndpoint,
      facilityType,
      facilityNames
    });

    return createDataStreamResponse({
      execute: async (dataStream) => {
        // Stream some useful text with the results
        const result = streamText({
          model: openai,
          messages: [
            {
              role: "assistant",
              content: `Foram encontrados os seguintes códigos: ${facilityCodes.join(", ")}.`
            }
          ]
        });

        result.mergeIntoDataStream(dataStream);
      }
    });
  }

  // If facilityType is "national"
  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: openai,
        messages: [
          {
            role: "assistant",
            content: "A consulta será processada."
          }
        ]
      });

      result.mergeIntoDataStream(dataStream);
    }
  }); 
}

async function runAgentAnalyzeData({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}

async function runAgentGenerateExcelReport({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}

async function runAgentGeneric({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}
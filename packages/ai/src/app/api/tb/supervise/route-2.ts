import { NextRequest, NextResponse } from "next/server";
import { 
  extractTheFacilityNamesInTheQuery, 
  FacilityType, 
  generateHealthcareDictCodes, 
  getDictionaryEndpoint, 
  getTimeInterval, 
  superviseDashboardReports 
} from "@/agents(old)/supervisor";
import { z } from "zod";
import { streamText, createDataStreamResponse, generateObject } from "ai";
import { openai } from "@/config/openai";
import { SUPERVISOR_PROMPT } from "@/prompts/tb";

const requestSchema = z.object({
  query: z.string(),
  endpoint: z.string(),
  facilityType: z.enum([
    "lab", 
    "province", 
    "district", 
    "clinic", 
    "national"
  ])
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, endpoint, facilityType, agent, description } = body;

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
      const result = await runAgentGetDataFromApi({query, endpoint, facilityType, description});
      return result;
    } 
    else if(agentToRun === "agent-analyze-data") {
      // const result = await runAgentAnalyzeData({query, endpoint, facilityType});
      // return result;
      console.log("agentToRun", agentToRun);
      return {}
    }
    else if(agentToRun === "agent-generate-excel-report") {
      // const result = await runAgentGenerateExcelReport({query, endpoint, facilityType});
      // return result;
      console.log("agentToRun", agentToRun);
      return {}
    }
    else {
      console.log("agentToRun", agentToRun);
      return {}
      // const result = await runAgentGeneric({query, endpoint, facilityType});
      // return result;
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
      agent: z.enum([
        "agent-get-data-from-api", 
        "agent-analyze-data", 
        "agent-generate-excel-report", 
        "agent-generic"
      ]).describe("The agent to be used to answer the query"),
      reason: z.string().describe("The reason for the classification"),
    }),
    prompt: `
      ${SUPERVISOR_PROMPT}
      
      QUESTÃO: ${query}
    `
  });

  return classification;
}

export async function runAgentGetDataFromApi({query, endpoint, facilityType, description}: {query: string, endpoint: string, facilityType: FacilityType, description: string}) {
  //function to get the data from the api
  const fetchDataFromApi = async (endpoint: string, timeInterval: { startDate: string; endDate: string }) => {
    try {
      const url = new URL(endpoint);
      if (timeInterval?.startDate && timeInterval?.endDate) {
        url.searchParams.append("start", timeInterval.startDate);
        url.searchParams.append("end", timeInterval.endDate);
      }
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };
  
  if(facilityType === "national") {
    const timeInterval = await getTimeInterval(query);
    const apiData = await fetchDataFromApi(endpoint, {
      startDate: timeInterval.startDate,
      endDate: timeInterval.endDate,
    });

    if(!apiData) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch data from API"
        }),
        { status: 500 }
      );
    }

    return createDataStreamResponse({
      execute: async (dataStream) => {
        // Send the agent information as a separate JSON line
        dataStream.writeData(
          JSON.stringify({
            agent: "agent-analyze-data",
            data: apiData,
            endpoint,
            facilityType: "national",
          }) + '\n'
        );

        const result = await runAgentAnalyzeData({
          query,
          timeInterval,
          description: apiData?.description,
          resume: apiData?.resume
        })
    
        result.mergeIntoDataStream(dataStream);
      }
    });
  }
  else {
    const dictEndpoint = getDictionaryEndpoint(facilityType);
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
            endpoint,
            facilityType,
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
            showLabsSelector: true,
            endpoint,
            facilityType,
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
        dataStream.writeData({ 
          agent: "agent-get-data-from-api",
          facilityType: "national"
        });

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
  
}

async function runAgentAnalyzeData({
  query, 
  timeInterval, 
  description, 
  resume
}: {
  query: string, 
  timeInterval: { 
    startDate: string; 
    endDate: string 
  }, 
  description: string, 
  resume: string
}) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    try {
      const result = await streamText({
        model: openai,
        prompt: `
          Tu es um assistente de IA que analise relatorios de Dados de Tuberculose (TB). Os relatorios constam de uma Dashboard de TB.
          Ajude a responder a questao do utilizador sobre o relatorio, apresentando uma explicacao detalhada do resultado do relatorio.

          Para analisar o relatorio tens a sua disposicao uma DESCRICAO, PERIODO, RESUMO e a QUESTÃO do relatorio.
          A DESCRICAO é uma descricao do relatorio que explica o que o relatorio deve reportar. \
          A PERIODO é o periodo de tempo que o relatorio cobre.
          O RESUMO é um resumo que descreve o resultado do relatorio apos a sua execucao.
          A QUESTÃO é a questao que o utilizador fez sobre o relatorio.

          DESCRICAO DO RELATORIO: ${description}

          RESUMO DO RELATORIO: ${resume}

          PERIODO DO RELATORIO: ${timeInterval.startDate} a ${timeInterval.endDate}

          QUESTÃO: ${query}
        `
      });

      for await (const chunk of result) {
        await writer.write(encoder.encode(chunk));
      }
    } catch (error) {
      console.error("Error in stream:", error);
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function runAgentGenerateExcelReport({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}

async function runAgentGeneric({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}
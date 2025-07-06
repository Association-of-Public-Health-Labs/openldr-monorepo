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
    const { messages, endpoint, facilityType, agent, description, reportName, facilities } = body;
    console.log(endpoint, facilityType, agent, description, reportName, facilities);
    const query = messages?.[messages.length - 1]?.content;
    if (!query) {
      throw new Error("Query not found");
    }
    let agentToRun;
    
    if(!agent) {
      const supervisorResponse = await supervise({query, endpoint, facilityType, messages});
      agentToRun = supervisorResponse.agent;
    }
    else {
      agentToRun = agent || "agent-generic";
    }

    if(agentToRun === "agent-get-data-from-api") {
      const result = await runAgentGetDataFromApi({query, endpoint, facilityType, reportName, description, messages});
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
      const result = await runAgentGeneric({query, reportName, description, messages});
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


export async function supervise({query, endpoint, facilityType, messages}: {query: string, endpoint: string, facilityType: string, messages: any}) {
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
    messages: [
      {
        role: "system",
        content: SUPERVISOR_PROMPT
      },
      // Add the last 6 messages to the system prompt
      ...messages?.slice(-6),
      {
        role: "user",
        content: `
          QUESTÃO: ${query}
        `
      }
    ],
    // prompt: `
    //   ${SUPERVISOR_PROMPT}

    //   Considere as mensagens anteriores para responder a QUESTÃO.
      
    //   QUESTÃO: ${query}
    // `
  });

  return classification;
}

export async function runAgentGetDataFromApi({query, endpoint, facilityType, reportName, description, messages, facilities}: {
  query: string, 
  endpoint: string, 
  facilityType: FacilityType, 
  reportName: string, 
  description: string, 
  messages: any, 
  facilities?: string[]
}) {
  //function to get the data from the api
  const fetchDataFromApi = async (endpoint: string, timeInterval: { startDate: string; endDate: string }, facilities?: string[]) => {
    try {
      const url = new URL(endpoint);
      if (timeInterval?.startDate && timeInterval?.endDate) {
        url.searchParams.append("start", timeInterval.startDate);
        url.searchParams.append("end", timeInterval.endDate);
      }
      if (facilities?.length && facilities.length > 0) {
        url.searchParams.append("facilities", facilities.join(","));
      }
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };
  
  const timeInterval = await getTimeInterval(query);

  if(facilityType === "national") {
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
            type: "metadata"
          }) + '\n'
        );

        await runAgentAnalyzeData({
          timeInterval,
          reportName,
          description: apiData?.description,
          resume: apiData?.resume,
          messages,
          dataStream
        })
    
      }
    });
  }
  else if(facilityType === "province") {
    //1st - check if the facilities are already selected
    if(facilities?.length && facilities.length > 0) {
      const apiData = await fetchDataFromApi(endpoint, {
        startDate: timeInterval.startDate,
        endDate: timeInterval.endDate,
      }, facilities);

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
              facilityType,
              type: "metadata"
            }) + '\n'
          );
  
          await runAgentAnalyzeData({
            timeInterval,
            reportName,
            description: apiData?.description,
            resume: apiData?.resume,
            messages,
            dataStream
          })
      
        }
      });
    }
    //2nd - if not, ask the user to select the facilities
    return createDataStreamResponse({
      execute: async (dataStream) => {
        // Send the agent information as a separate JSON line
        dataStream.writeData(
          JSON.stringify({
            agent: "agent-get-data-from-api",
            showFacilitiesSelector: true,
            endpoint,
            facilityType,
            type: "metadata"
          }) + '\n'
        );

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

// async function runAgentAnalyzeData({
//   query, 
//   timeInterval, 
//   reportName,
//   description, 
//   resume,
//   messages,
//   dataStream
// }: {
//   query: string, 
//   timeInterval: { 
//     startDate: string; 
//     endDate: string 
//   }, 
//   reportName: string,
//   description: string, 
//   resume: string,
//   messages: any,
//   dataStream: ReturnType<typeof createDataStreamResponse>["dataStream"];
// }) {
//     const result = await streamText({
//       model: openai,
//       messages: [
//         {
//           role: "system",
//           content: `
//             Tu és um assistente de inteligência artificial especializado na análise de dados sobre a Tuberculose (TB), integrado numa Dashboard oficial do Serviço Nacional de Saúde de Moçambique.

//             A tua função é interpretar os resultados dos relatórios disponíveis e responder de forma clara, objetiva e profissional às questões feitas pelos utilizadores.
//             Tens à tua disposição os seguintes elementos:

//             NOME DO RELATÓRIO: ${reportName}

//             DESCRIÇÃO DO RELATÓRIO: ${description}

//             RESUMO DOS RESULTADOS: ${resume}

//             PERÍODO DO RELATÓRIO: ${timeInterval.startDate} a ${timeInterval.endDate}

//             Instruções importantes:

//             Responde com base exclusiva nas informações disponíveis no RESUMO, DESCRIÇÃO e PERÍODO do relatório.

//             Não faças menção explícita a esses elementos (especialmente ao "resumo"), pois o utilizador não tem acesso direto a eles.

//             Apresenta uma explicação clara e fundamentada dos dados e conclusões do relatório, conforme solicitado na pergunta.

//             Evita fazer cálculos adicionais ou mencionar possíveis falhas ou inconsistências. Transmite confiança e profissionalismo na tua análise.

//             Se a pergunta não puder ser respondida com as informações fornecidas, solicita educadamente ao utilizador que reformule ou esclareça a questão.
//           `,
//         },
//         ...messages?.slice(-6),
//         {
//           role: "user",
//           content: `
//             QUESTÃO: ${query}
//           `
//         }
//       ],
//       // prompt: `
//       //   Tu és um assistente de inteligência artificial especializado na análise de dados sobre a Tuberculose (TB), integrado numa Dashboard oficial do Serviço Nacional de Saúde de Moçambique.

//       //   A tua função é interpretar os resultados dos relatórios disponíveis e responder de forma clara, objetiva e profissional às questões feitas pelos utilizadores.
//       //   Tens à tua disposição os seguintes elementos:

//       //   NOME DO RELATÓRIO: ${reportName}

//       //   DESCRIÇÃO DO RELATÓRIO: ${description}

//       //   RESUMO DOS RESULTADOS: ${resume}

//       //   PERÍODO DO RELATÓRIO: ${timeInterval.startDate} a ${timeInterval.endDate}

//       //   QUESTÃO DO UTILIZADOR: ${query}

//       //   Instruções importantes:

//       //   Responde com base exclusiva nas informações disponíveis no RESUMO, DESCRIÇÃO e PERÍODO do relatório.

//       //   Não faças menção explícita a esses elementos (especialmente ao "resumo"), pois o utilizador não tem acesso direto a eles.

//       //   Apresenta uma explicação clara e fundamentada dos dados e conclusões do relatório, conforme solicitado na pergunta.

//       //   Evita fazer cálculos adicionais ou mencionar possíveis falhas ou inconsistências. Transmite confiança e profissionalismo na tua análise.

//       //   Se a pergunta não puder ser respondida com as informações fornecidas, solicita educadamente ao utilizador que reformule ou esclareça a questão.
//       // `,
      
//     });

//     result.mergeIntoDataStream(dataStream);
// }

export async function runAgentAnalyzeData({
  timeInterval,
  reportName,
  description,
  resume,
  messages,
  dataStream,
}: {
  timeInterval: { startDate: string; endDate: string };
  reportName: string;
  description: string;
  resume: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  dataStream: ReturnType<typeof createDataStreamResponse>['dataStream'];
}) {
  // Limit chat memory to last 6 exchanges to avoid token overflow
  const recentMessages = messages.slice(-6);

  const systemMessage = {
    role: "system" as const,
    content: `
      Tu és um assistente de inteligência artificial especializado na análise de dados sobre a Tuberculose (TB), integrado numa Dashboard oficial do Serviço Nacional de Saúde de Moçambique.

      A tua função é interpretar os resultados dos relatórios disponíveis e responder de forma clara, objetiva e profissional às questões feitas pelos utilizadores.

      Tens à tua disposição:
      - NOME DO RELATÓRIO: ${reportName}
      - DESCRIÇÃO DO RELATÓRIO: ${description}
      - RESUMO DOS RESULTADOS: ${resume}
      - PERÍODO DO RELATÓRIO: ${timeInterval.startDate} a ${timeInterval.endDate}

      📌 Instruções importantes:
      - Responde **exclusivamente** com base nas informações fornecidas acima.
      - **Não menciones** diretamente "resumo" ou "descrição" na tua resposta.
      - **Evita inventar** dados ou fazer suposições que não estão explícitas.
      - Se não conseguires responder com base nas informações fornecidas, **pede ao utilizador para reformular a pergunta**.
    `
  };

  const result = await streamText({
    model: openai,
    messages: [systemMessage, ...recentMessages],
  });

  result.mergeIntoDataStream(dataStream);
  // dataStream.close();
}

async function runAgentGenerateExcelReport({query, endpoint, facilityType}: {query: string, endpoint: string, facilityType: FacilityType}) {

}

// async function runAgentGeneric({
//   query, 
//   reportName,
//   description, 
//   resume,
//   messages,
// }: {
//   query: string, 
//   reportName: string,
//   description: string, 
//   resume?: string,
//   messages: any,
// }) {
//   return createDataStreamResponse({
//     execute: async (dataStream) => {
//       // Send the agent information as a separate JSON line
//       dataStream.writeData(
//         JSON.stringify({
//           agent: "agent-generic",
//           reportName,
//           description,
//           resume,
//           type: "metadata"
//         }) + '\n'
//       );

//       const result = await streamText({
//         model: openai,
//         messages: [
//           {
//             role: "system",
//             content: `
//               Tu és um assistente de inteligência artificial integrado numa dashboard de Tuberculose (TB) do Serviço Nacional de Saúde de Moçambique.
//               O teu objetivo é ajudar os utilizadores a compreenderem melhor os relatórios apresentados, respondendo a perguntas com base nas informações disponíveis.
//             `
//           },
//           ...messages,
//           {
//             role: "assistant",
//             content: `
//               Tens à tua disposição:
    
//               NOME DO RELATÓRIO: ${reportName}
        
//               DESCRIÇÃO DETALHADA DO RELATÓRIO: ${description}
        
//               QUESTÃO DO UTILIZADOR: ${query}
        
//               Instruções importantes:
        
//               Responde exclusivamente com base nas informações presentes na DESCRIÇÃO DO RELATÓRIO.
        
//               Não inventes nem assumas dados que não estejam claramente presentes na descrição.
        
//               Se a questão não for clara ou se a resposta não puder ser inferida da descrição, responde educadamente solicitando ao utilizador que reformule a pergunta ou especifique melhor a dúvida.
//             `
//           },
//           {
//             role: "user",
//             content: `
//               QUESTÃO: ${query}
//             `
//           }
//         ],
//         // prompt: `
//         //   Tu és um assistente de inteligência artificial integrado numa dashboard de Tuberculose (TB) do Serviço Nacional de Saúde de Moçambique.
//         //   O teu objetivo é ajudar os utilizadores a compreenderem melhor os relatórios apresentados, respondendo a perguntas com base nas informações disponíveis.
    
//         //   Tens à tua disposição:
    
//         //   NOME DO RELATÓRIO: ${reportName}
    
//         //   DESCRIÇÃO DETALHADA DO RELATÓRIO: ${description}
    
//         //   QUESTÃO DO UTILIZADOR: ${query}
    
//         //   Instruções importantes:
    
//         //   Responde exclusivamente com base nas informações presentes na DESCRIÇÃO DO RELATÓRIO.
    
//         //   Não inventes nem assumas dados que não estejam claramente presentes na descrição.
    
//         //   Se a questão não for clara ou se a resposta não puder ser inferida da descrição, responde educadamente solicitando ao utilizador que reformule a pergunta ou especifique melhor a dúvida.
//         // `
//       });
    
//       result.mergeIntoDataStream(dataStream);
  
//     }
//   });
  
// }


export async function runAgentGeneric({
  reportName,
  description,
  messages,
  resume,
}: {
  query: string;
  reportName: string;
  description: string;
  resume?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const recentMessages = messages.slice(-6);

  const systemMessage = {
    role: 'system' as const,
    content: `
      Tu és um assistente de inteligência artificial integrado numa dashboard de Tuberculose (TB) do Serviço Nacional de Saúde de Moçambique.

      O teu objetivo é ajudar os utilizadores a compreenderem melhor os relatórios apresentados, respondendo a perguntas com base nas informações disponíveis.

      Contexto disponível:
      - NOME DO RELATÓRIO: ${reportName}
      - DESCRIÇÃO DETALHADA: ${description}
      ${resume ? `- RESUMO DOS RESULTADOS: ${resume}` : ''}
        
      📌 Instruções:
      - Usa somente as informações fornecidas acima.
      - Não adiciones suposições nem calcules dados fora do contexto.
      - Se a questão não puder ser respondida com essas informações, responde educadamente pedindo que o utilizador reformule.
    `
  };

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeData(
        JSON.stringify({
          agent: 'agent-generic',
          reportName,
          description,
          resume,
          type: 'metadata',
        }) + '\n'
      );

      const result = await streamText({
        model: openai,
        messages: [systemMessage, ...recentMessages],
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

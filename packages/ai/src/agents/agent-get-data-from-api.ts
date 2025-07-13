
import { streamText, createDataStreamResponse, LanguageModelV1 } from "ai";
import { getDictionaryEndpoint } from "@/tools/dictionary";
import { DashboardType, FacilityType } from "@/types";
import agentReportData from "@/agents/agent-report-data";
import agentExtractFacilitiesInQuery from "@/agents/agent-extract-facilities-in-query";
import agentGenerateHealthcareCodes from "@/agents/agent-generate-healthcare-codes";
import agentGetInterval from "@/agents/agent-get-interval";
import { MODELS } from "@/config/constants";
import openrouter from "@/config/openrouter";


export async function execute({query, endpoint, facilityType, reportName, dashboard, description, messages, facilities}: {
  query: string, 
  endpoint: string, 
  facilityType: FacilityType, 
  reportName: string, 
  dashboard: DashboardType,
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
  
  const timeInterval = await agentGetInterval.execute({query});

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
            type: "metadata",
            showFacilitySelector: false,
          }) + '\n'
        );

        await agentReportData.execute({
          query,
          timeInterval,
          reportName,
          description: apiData?.description,
          resume: apiData?.resume,
          dashboard,
          messages,
          dataStream
        })
    
      }
    });
  }
  else if(["province", "district", "clinic"].includes(facilityType)) {
    //1st - check if the facilities are already selected
    if(facilities?.length && facilities?.length > 0) {
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
              agent: "agent-report-data",
              data: apiData,
              endpoint,
              facilityType,
              type: "metadata",
              showFacilitySelector: false,
            }) + '\n'
          );
  
          await agentReportData.execute({
            query,
            timeInterval,
            reportName,
            description: apiData?.description,
            resume: apiData?.resume,
            dashboard,
            messages,
            dataStream
          })
      
        }
      });
    }
    else {
      return createDataStreamResponse({
        execute: async (dataStream) => {
          // Send the agent information as a separate JSON line
          dataStream.writeData(
            JSON.stringify({
              agent: "agent-get-data-from-api",
              showFacilitiesSelector: true,
              index: messages.length,
              endpoint,
              facilityType,
              type: "metadata",
            }) + '\n'
          );
  
          const result = streamText({
            model: openrouter.chat(MODELS.REPORT) as LanguageModelV1,
            messages: [
              {
                role: "system",
                content: "Voce e um assistente de IA. Sempre termine suas respostas com a tag de comentario <!-- showfacilities:true -->"
              },
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
  }
  else {
    const dictEndpoint = getDictionaryEndpoint(facilityType);
    const [{ facilityNames }, timeInterval] = await Promise.all([
      agentExtractFacilitiesInQuery.execute({ query }),
      agentGetInterval.execute({query})
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
            model: openrouter.chat(MODELS.REPORT) as LanguageModelV1,
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
            model: openrouter.chat(MODELS.REPORT) as LanguageModelV1,
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

    const facilityCodes = await agentGenerateHealthcareCodes.execute({
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
          model: openrouter.chat(MODELS.REPORT) as LanguageModelV1,
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

export default {
  execute
}
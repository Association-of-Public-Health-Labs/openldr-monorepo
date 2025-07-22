import { z } from "zod";
import { generateObject, generateText, tool, createDataStreamResponse, streamText } from "ai";
import { generateHealthcareDictionaryCodes, identifyFacilitiesInTheQuery } from "./dict-classifier";
import { openai } from "../config/openai"
import { queryTypeClassifier } from "./query-type-classifier";
import { hivLaboratoryPrompt, hivClinicalPrompt, hivNationalPrompt } from "../prompts/viralload";

interface EndpointInfo {
  endpoint: string;
  name: string;
  description: string;
}

async function identifyDashboardEndpoints(query: string, facilityType: string): Promise<EndpointInfo[]> {
  const { object: endpoints } = await generateObject({
    model: openai,
    schema: z.object({
      endpoints: z.array(z.object({
        endpoint: z.string().describe("O endpoint da api que deve ser usado para gerar o relatorio"),
        name: z.string().describe("O nome do endpoint"),
        description: z.string().describe("A descricao do endpoint")
      }))
    }),
    prompt: getPromptByFacilityType(query, facilityType)
  });

  return endpoints.endpoints as EndpointInfo[];
}

function getPromptByFacilityType(query: string, facilityType: string): string {
  const basePrompt = `
    Analise a questão e retorne um ARRAY com TODOS os endpoints relevantes que podem ser usados para responder à pergunta.
    Retorne APENAS os endpoints que são DIRETAMENTE relacionados à questão.
    
    QUESTÃO: ${query}
  `;

  switch (facilityType) {
    case "laboratory":
      return `${basePrompt}\n${hivLaboratoryPrompt(query)}`;
    case "district":
      return `${basePrompt}\n${hivClinicalPrompt(query)}`;
    case "province":
      return `${basePrompt}\n${hivClinicalPrompt(query)}`;
    default:
      throw new Error(`Unsupported facility type: ${facilityType}`);
  }
}

interface TimeInterval {
  startDate: string;
  endDate: string;
  isDefault: boolean;
}

export async function getTimeInterval(query: string): Promise<TimeInterval> {
  const currentDate = new Date();
  const defaultStartDate = new Date(currentDate.setMonth(currentDate.getMonth() - 12));
  
  const { object: timeInfo } = await generateObject({
    model: openai,
    schema: z.object({
      hasTimeInterval: z.boolean().describe("Indica se a questão especifica um intervalo de tempo"),
      startDate: z.string().optional().describe("Data inicial no formato YYYY-MM-DD"),
      endDate: z.string().optional().describe("Data final no formato YYYY-MM-DD"),
    }),
    prompt: `
      Analise a questão e identifique o intervalo de tempo mencionado.
      Se não houver intervalo específico, retorne hasTimeInterval como false.
      Converta períodos textuais em datas específicas (ex: "primeiro trimestre de 2024" = "2024-01-01" a "2024-03-31")
      Use o formato de data YYYY-MM-DD.

      Exemplos de intervalos:
      - "janeiro a março de 2024"
      - "primeiro trimestre de 2024"
      - "2023"
      - "últimos 6 meses"
      - "desde janeiro"
      
      QUESTÃO: ${query}
    `
  });

  if (!timeInfo.hasTimeInterval) {
    return {
      startDate: defaultStartDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      isDefault: true
    };
  }

  return {
    startDate: timeInfo.startDate || defaultStartDate.toISOString().split('T')[0],
    endDate: timeInfo.endDate || new Date().toISOString().split('T')[0],
    isDefault: false
  };
}

interface DashboardQueryResponse {
  facilityType: string;
  facilityCodes: any;
  endpoints: EndpointInfo[];
  timeInterval: TimeInterval;
  originalQuery: string;
  data?: any;
  singleEndpoint?: boolean;
  error?: string;
}

interface ApiQueryParams {
  startDate: string;
  endDate: string;
  codes?: string[];
  type?: string;
}

async function fetchDashboardData (endpoint: string, params: ApiQueryParams) {
  try {
    // Create URL with base path
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/viralload${endpoint}`);
    
    // Add dates as separate array elements in query string
    url.searchParams.append('dates[]', params.startDate);
    url.searchParams.append('dates[]', params.endDate);
    
    // Add facility codes if present
    if (params.codes && params.codes.length > 0) {
      params.codes.forEach(code => {
        url.searchParams.append('codes[]', code);
      });
    }

    // Add facility type
    if (params.type) {
      url.searchParams.append('type', params.type);
    }

    console.log("URL: ", url.toString());

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
}

export async function executeSupervisor({query}: {query: string}) {
  const response = await queryTypeClassifier({query});

  if (response.type === "quantitative") {
    quantitativeQuery({query});
  }
  else {
    
  }
}

export async function quantitativeQuery({query}: {query: string}): Promise<DashboardQueryResponse | undefined> {
  try {
    const [facilityResponse, timeInterval] = await Promise.all([
      identifyFacilitiesInTheQuery({query}),
      getTimeInterval(query)
    ]);

    if(facilityResponse.facilityType === "clinic") {
      // Handle clinic logic
    }
    else if(
      facilityResponse.facilityType === "laboratory" || 
      facilityResponse.facilityType === "district" || 
      facilityResponse.facilityType === "province"
    ) {
      const [codes, dashboardEndpoints] = await Promise.all([
        generateHealthcareDictionaryCodes({
          query, 
          endpoint: facilityResponse.endpoint, 
          facilityType: facilityResponse.facilityType, 
          facilityNames: facilityResponse?.facilityNames.filter((name): name is string => name !== undefined)
        }),
        identifyDashboardEndpoints(
          query, 
          facilityResponse.facilityType
        )
      ]);

      const facilityCodes = getFacilityCodes(codes, facilityResponse.facilityType);

      const response: DashboardQueryResponse = {
        facilityType: facilityResponse.facilityType,
        facilityCodes: facilityCodes,
        endpoints: dashboardEndpoints,
        timeInterval,
        originalQuery: query
      };

      // If there's exactly one endpoint, fetch the data
      if (dashboardEndpoints.length === 1) {
        try {
          const { codes, type } = facilityCodes;
          
          const apiParams: ApiQueryParams = {
            startDate: timeInterval.startDate,
            endDate: timeInterval.endDate,
            // codes: facilityCodes,
            type: type
          };

          const data = await fetchDashboardData(dashboardEndpoints[0].endpoint, apiParams);

          return {
            ...response,
            data,
            singleEndpoint: true
          };
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          return {
            ...response,
            error: "Failed to fetch dashboard data",
            singleEndpoint: true
          };
        }
      }

      return response;
    }
  } catch (error) {
    console.error("Error in quantitative query processing:", error);
    throw error;
  }
}

function getFacilityCodes(codes: any, facilityType: string): { codes: string[], type: string } {
    switch (facilityType) {
      case "laboratory":
        return { 
          codes: [codes.laboratoryCode],
          type: "laboratory"
        };
      case "province":
        return codes?.map((code: any) => code?.facilityName);
      case "district":
        return { 
          codes: [codes.districtCode],
          type: "district"
        };
      default:
        return { 
            codes: [],
            type: "province" // default type
          };
      }

}

export type FacilityType = "lab" | "province" | "district" | "clinic" | "national";

type SuperviseDashboardReportsProps = {
  query: string, 
  endpoint: string, 
  facilityType: FacilityType
}

export async function superviseDashboardReports({query, endpoint, facilityType}: SuperviseDashboardReportsProps) {
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

export async function extractTheFacilityNamesInTheQuery({query}: {query: string}) {
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      facilityNames: z.array(z.string().optional()).describe("Os nomes das facilities que o cliente esta a perguntar"),
    }),
    prompt: `
      Você é um assistente de IA especializado em Sistemas de Informação Laboratorial que identifica os nomes das facilities na questao do cliente.
      Dada a QUESTÃO, voce deve identificar os nomes das facilities (facilityNames) que o cliente esta a perguntar.

      Por exemplo: "Qual e a media da Supressao Viral em Maputo Cidade?"
      Neste caso, a facilityNames será: ["Maputo Cidade"]

      Por exemplo: "Qual e a media da Supressao Viral em Namacurra e Quelimane?"
      Neste caso, a facilityNames será: ["Namacurra", "Quelimane"]

      Por exemplo: "Qual e a media da Supressao Viral no CS de Alto-Mae?"
      Neste caso, a facilityNames será: ["CS de Alto-Mae"]

      QUESTÃO: ${query}
    `,
  });

  return classification;
}

export async function generateHealthcareDictCodes({query, endpoint, facilityType, facilityNames}: {
  query: string, 
  endpoint: string | null, 
  facilityType: string, 
  facilityNames: (string | undefined)[]
}) {
  console.log(endpoint, facilityType)
  const facilityTypeText = facilityType === "province" ? "as Provincias" : facilityType === "district" ? "os Distritos" : facilityType === "clinic" ? "as Unidades Sanitarias" : "";
  const answer = await generateText({
    model: openai,
    prompt: query,
    system: `
      Você é um assistente de IA especializado em Sistemas de Informação Laboratorial que gera códigos de dicionário de saúde para as facilities identificadas na questão do cliente.
      
      Você deve usar o endpoint ${endpoint} para obter ${facilityTypeText}.
      
      Uma vez que tenha a lista d${facilityTypeText}, filtre a lista para obter apenas os nomes similares aos nomes das facilities identificadas a baixo.
      
      RETORNE APENAS OS NOMES DAS FACILITIES, NÃO RETORNE NADA MAIS. RETORNE APENAS O ARRAY, com a seguinte estrutura:
      [
        {
          "facilityName": "Nome da Facility",
          "facilityCode": "Codigo da Facility"
        }, 
        ...
      ]

      RETORNE APENAS O ARRAY (SEM a notacao json), NÃO RETORNE NADA MAIS.

      Nomes das facilities: ${facilityNames.join(", ")}.
      
      QUESTÃO: ${query}.

      ENDPOINT: ${endpoint}.
    `,
    tools: {
      fetchData: fetchHealthcareData
    },
    maxSteps: 5
  });
  
  return JSON.parse(answer?.text || "[]");
}

const fetchHealthcareData = tool({
  description: "Faz uma chamada ao endpoint do dicionario do OpenLDR",
  parameters: z.object({
    apiEndpoint: z.string().describe("O endpoint do dicionario do OpenLDR"),
  }),
  // location below is inferred to be a string:
  execute: async ({ apiEndpoint }) => {
    const response = await fetch("https://queue.openldr.org.mz" + apiEndpoint)
    const data = await response.json()
    return data 
  },
});

export async function fetchDataFromOpenLDR({ apiEndpoint }: { apiEndpoint: string }) {
  const response = await fetch("https://queue.openldr.org.mz" + apiEndpoint)
  const data = await response.json()
  return data
}

export function getDictionaryEndpoint (facilityType: FacilityType) {
  switch (facilityType) {
    case "province":
      return "/dict/provinces";
    case "district":
      return "/dict/districts";
    case "clinic":
      return "/dict/clinics";
    case "lab":
      return "/dict/labs";
    case "national":
      return null;
    default:
      return null;
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

import { generateObject, generateText, tool } from "ai"
import { openai } from "../config/openai"
import { z } from "zod"

interface DictionaryClassifierProps {
  query: string;
}

export async function dictionaryClassifier({query}: DictionaryClassifierProps) {
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      type: z.enum(["national", "province","district", "clinic", "unknown"]),
    }),
    prompt: `
      Classify this customer query:
      ${query}

      Determine if the query is qualitative, quantitative, or unknown:
      1. Qualitative: The query is asking for a description or explanation of the data.
      2. Quantitative: The query is asking for a specific numerical value or calculation.
      3. Unknown: The query is not clear or does not fit into the other categories.
    `,
  });

  return classification;
}


export async function identifyFacilitiesInTheQuery({query}: {query: string}) {
  const { object: classification } = await generateObject({
    model: openai,
    schema: z.object({
      endpoint: z.string(),
      facilityType: z.enum(["province", "district", "clinic", "laboratory", "national", "unknown"]),
      facilityNames: z.array(z.string().optional()),
    }),
    prompt: `
       Você é um assistente de IA especializado em Sistemas de Informação Laboratorial que identifica o endpoint de chamada a API correspondente ao pedido feito na questao do cliente.
       Voce deve identificar o tipo de facility (facilityType) e os nomes das facilities (facilityNames) que o cliente esta a perguntar.

       1. Sempre que a questão estiver relacionada a Provincias, responda com o endpoint: /dict/provinces  
          - As provincias são: Niassa, Cabo Delgado, Nampula, Tete, Zambezia, Manica, Sofala, Maputo Cidade (Cidade de Maputo), Maputo Província (Província de Maputo), Gaza, Inhambane

       2. Sempre que a questao estiver relacionada a Distritos, responda com o endpoint: /dict/districts

       3. Sempre que a questao estiver relacionada a Unidade Sanitaria/US, responda com o endpoint: /dict/clinics
       3. Sempre que a questao estiver relacionada a Unidade Sanitaria/US, responda com o endpoint: /dict/clinics
       4. Sempre que a questao estiver relacionada a um Laboratorio/Lab, responda com o endpoint: /dict/labs
       5. Sempre que a questao estiver relacionada a todo país/Mocambique, responda com o endpoint: /dict/national
       6. Caso não seja possivel identificar a questao, responda com o endpoint: unknown

       Caso consiga identificar o endpoint, responda com a facilityType correspondente:
       - province (se a questao estiver relacionada a Provincias)
       - district (se a questao estiver relacionada a Distritos)
       - clinic (se a questao estiver relacionada a Unidade Sanitarias)
       - laboratory (se a questao estiver relacionada a Laboratorios)
       - national (se a questao estiver relacionada a todo país/Mocambique)
       - unknown (se não for possivel identificar as facilities)

       Liste todos os nomes das facilities presentes na questao, use o campo facilityNames. 

       QUESTÃO: ${query}
    `,
  });

  return classification;
}

export const fetchHealthcareData = tool({
  description: 'Get the weather in a location',
  parameters: z.object({
    apiEndpoint: z.string().describe('The location to get the weather for'),
  }),
  // location below is inferred to be a string:
  execute: async ({ apiEndpoint }) => {
    const response = await fetch("https://queue.openldr.org.mz" + apiEndpoint)
    const data = await response.json()
    return data
  },
});

export async function generateHealthcareDictionaryCodes({query, endpoint, facilityType, facilityNames}: {query: string, endpoint: string, facilityType: string, facilityNames: string[]}) {
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

interface HealthFacility {
  facilityName: string;
  facilityCode: string;
  nationalCode: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
}

// export async function querySemanticSearchForHealthFacilities({
//   query,
//   tableName = "facilities_embeddings",
//   k = 10,
// }: {
//   query: string;
//   tableName?: string;
//   k?: number;
// }) {
//   try {
//     const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
//     // Use the same embedding model as used during creation
//     const embeddings = new OpenAIEmbeddings({ 
//       openAIApiKey: process.env.OPENAI_API_KEY, 
//       modelName: "text-embedding-3-small", // Match the model used in creation
//       dimensions: 1536, // Standard OpenAI embedding dimensions
//     });

//     // Initialize vector store
//     const vectorStore = await PGVectorStore.initialize(
//       embeddings,
//       {
//         postgresConnectionOptions: {
//           connectionString: process.env.POSTGRES_CONNECTION_STRING,
//         },
//         tableName,
//         columns: {
//           idColumnName: "id",
//           vectorColumnName: "embedding",
//           contentColumnName: "content",
//           metadataColumnName: "metadata",
//         }
//       }
//     );
    
//     // Preprocess the query to enhance search relevance
//     const enhancedQuery = await enhanceSearchQuery(query, openai);
    
//     // Search with metadata and score
//     const searchResults = await vectorStore.similaritySearch(enhancedQuery);
//     // const searchResults = await vectorStore.similaritySearchWithScore(enhancedQuery, k);
    
//     // Filter and sort results by relevance
//     const relevantDocs = searchResults
//       .filter(([_, score]) => score > 0.7)
//       .sort((a, b) => b[1] - a[1])
//       .map(([doc]) => doc);

//     // Extract and structure the context
//     const structuredContext = relevantDocs.map(doc => {
//       const metadata = doc.metadata;
//       return {
//         content: doc.pageContent,
//         metadata,
//         relevanceScore: searchResults.find(([d]) => d.metadata === metadata)?.[1]
//       };
//     });

//     const prompt = `
//       Você é um assistente especializado em Sistemas de Informação Laboratorial que analisa informações sobre unidades sanitárias do Repositório de Dados Laboratoriais.

//       INSTRUÇÕES IMPORTANTES:
//       1. Analise cuidadosamente o contexto fornecido abaixo
//       2. Identifique APENAS as unidades sanitárias que correspondem EXATAMENTE à questão do utilizador
//       3. Se não encontrar correspondências exatas, NÃO tente adivinhar ou aproximar
//       4. Retorne APENAS as unidades sanitárias que têm certeza absoluta da correspondência
//       5. Mantenha os códigos e nomes EXATAMENTE como aparecem no contexto

//       CONTEXTO:
//       ${structuredContext.map(ctx => ctx.content).join('\n---\n')}

//       QUESTÃO DO UTILIZADOR: ${query}

//       Retorne a resposta no seguinte formato JSON:
//       {
//         "facilities": [
//           {
//             "facilityName": "Nome exato da Unidade Sanitária",
//             "facilityCode": "Código exato",
//             "nationalCode": "Código Nacional exato",
//             "provinceCode": "Código exato da Província",
//             "provinceName": "Nome exato da Província",
//             "districtCode": "Código exato do Distrito",
//             "districtName": "Nome exato do Distrito"
//           }
//         ],
//         "matchCount": número_de_correspondências_encontradas,
//         "confidence": "HIGH|MEDIUM|LOW baseado na exatidão das correspondências"
//       }
//     `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4-turbo-preview",
//       messages: [
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//       temperature: 0.1,
//       max_tokens: 1000,
//       response_format: { type: "json_object" }
//     });

//     const response = JSON.parse(completion.choices[0].message.content || "{}");

//     return {
//       ...response,
//       sourceDocs: relevantDocs,
//       context: structuredContext
//     };
//   } catch (error) {
//     console.error("Error querying vector store:", error);
//     throw error;
//   }
// }

// async function enhanceSearchQuery(query: string, openai: OpenAI): Promise<string> {
//   const prompt = `
//     Analise a seguinte questão sobre unidades sanitárias e reformule-a para melhorar a busca semântica,
//     mantendo todos os termos importantes e adicionando sinônimos relevantes:

//     QUESTÃO: ${query}

//     Retorne APENAS o texto reformulado, sem explicações.
//   `;

//   const completion = await openai.chat.completions.create({
//     model: "gpt-4-turbo-preview",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.1,
//   });

//   return completion.choices[0].message.content || query;
// }



// Dashboard Endpoints
// Número de Amostras : /dash/number_of_samples

// Taxa de Supressão Viral: /dash/viral_suppression

// Tempo de Resposta Laboratorial (TAT): /dash/tat

// Supressão Viral por Província: /dash/map

// Principais Indicadores (Amostras Registadas, Testadas, Rejeitadas e TAT): /dash/indicators

// 🧪 Laboratório (Lab) Endpoints
// Amostras por Motivo do Teste: /lab/samples_by_test_reason

// Amostras Testadas por Mêse por Laboratorio: /lab/samples_tested_by_month

// Amostras Testadas por cada Laboratório: /lab/samples_tested_by_lab

// Tempo de Resposta por Laboratório: /lab/tat

// Tempo de Resposta por Mês: /lab/tat_by_month

// Amostras por Gênero: /lab/samples_tested_by_gender

// Amostras por Gênero e Laboratório: /lab/samples_tested_by_gender_and_lab

// Amostras por Faixa Etária: /lab/samples_tested_by_age

// Amostras de Gestantes: /lab/samples_tested_by_pregnancy

// Amostras de Lactantes: /lab/samples_tested_breastfeeding

// Amostras Rejeitadas: /lab/samples_rejected

// Amostras Rejeitadas por Mês: /lab/samples_rejected_by_month

// Pendências de Processamento (Backlogs): /lab/backlogs

// Resumo Semanal por Laboratório: /lab/weekly_report

// Resumo Semanal Nacional: /lab/weekly_report_national

// 🏥 Clínica (Clinic) Endpoints
// Amostras por Motivo do Teste: /clinic/samples_by_test_reason

// Amostras Testadas por Mês: /clinic/samples_tested_by_month

// Amostras por Unidade de Saúde: /clinic/samples_tested_by_facility

// Amostras por Gênero: /clinic/samples_tested_by_gender

// Amostras por Gênero e Unidade: /clinic/samples_tested_by_gender_and_facility

// TAT por Mês: /clinic/tat

// TAT por Unidade de Saúde: /clinic/tat_by_facility

// Dias de TAT por Unidade: /clinic/tat_days_by_facility

// Dias de TAT por Mês: /clinic/tat_days_by_month

// Amostras por Faixa Etária: /clinic/samples_tested_by_age

// Amostras por Faixa Etária e Unidade: /clinic/samples_tested_by_age_and_facility

// Amostras de Gestantes por Unidade: /clinic/samples_tested_by_pregnancy

// Amostras de Lactantes por Unidade: /clinic/samples_tested_by_breastfeeding

// Amostras Registradas por Unidade: /clinic/registered_samples_by_facility

// Rejeições por Mês: /clinic/samples_rejected_by_month

// Rejeições por Unidade: /clinic/samples_rejected_by_facility

// Indicador de Qualidade por Unidade: /clinic/samples_quality_by_facility

// Indicador de Qualidade por Mês: /clinic/samples_quality_by_month

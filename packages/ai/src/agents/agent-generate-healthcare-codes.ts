
import openrouter from "@/config/openrouter";
import { MODELS } from "@/config/constants";
import dictionary from "@/tools/dictionary";
import { generateText, LanguageModelV1 } from "ai";

async function execute({query, endpoint, facilityType, facilityNames}: {
  query: string, 
  endpoint: string | null, 
  facilityType: string, 
  facilityNames: (string | undefined)[]
}) {
  console.log(endpoint, facilityType)
  const facilityTypeText = facilityType === "province" ? "as Provincias" : facilityType === "district" ? "os Distritos" : facilityType === "clinic" ? "as Unidades Sanitarias" : "";
  const answer = await generateText({
    model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,
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
      fetchData: dictionary.fetchHealthcareInfo
    },
    maxSteps: 5
  });
  
  return JSON.parse(answer?.text || "[]");
}

export default {
  execute
}
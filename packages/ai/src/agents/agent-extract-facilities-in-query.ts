import { generateObject, LanguageModelV1 } from "ai";
import openrouter from "@/config/openrouter";
import { z } from "zod";
import { MODELS } from "@/config/constants";

async function execute({query}: {query: string}) {
  const { object: classification } = await generateObject({
    model: openrouter.chat(MODELS.EXTRACTION) as LanguageModelV1,  
    schema: z.object({
      facilityNames: z.array(z.string().optional()).describe("Os nomes das facilities que o cliente esta a perguntar"),
    }),
    prompt: `
      Você é um assistente de IA especializado em Sistemas de Informação Laboratorial que identifica os nomes das facilities na questão do Utilizador.
      Dada a QUESTÃO, você deve identificar os nomes das facilities (facilityNames) que o Utilizador está a perguntar.

      Por exemplo: "Qual é a média da Supressão Viral em Maputo Cidade?"
      Neste caso, a facilityNames será: ["Maputo Cidade"]

      Por exemplo: "Qual é a média da Supressão Viral em Namacurra e Quelimane?"
      Neste caso, a facilityNames será: ["Namacurra", "Quelimane"]

      Por exemplo: "Qual é a média da Supressão Viral no CS de Alto-Mae?"
      Neste caso, a facilityNames será: ["CS de Alto-Mae"]

      QUESTÃO: ${query}
    `,
  });

  return classification;
}

export default {
  execute
}
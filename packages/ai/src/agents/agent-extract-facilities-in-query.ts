import { generateObject } from "ai";
import { openai } from "@/config/openai";
import { z } from "zod";

async function execute({query}: {query: string}) {
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

export default {
  execute
}
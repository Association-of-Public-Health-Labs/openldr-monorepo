'use server';

import { generateText, tool, streamText } from "ai"
import { createStreamableValue } from "ai/rsc";
import { openai } from "../config/openai"
import { z } from "zod"
interface AnswerQuestionsFromReportProps {
  message: string;
  apiEndpoint: string;
}

const fetchData = (apiEndpoint: string) => tool({
  description: "Fetch data from the provided API endpoint",
  parameters: z.object({
    apiEndpoint: z.string(),
    
  }),
  execute: async ({ apiEndpoint}) => {
    const response = await fetch(apiEndpoint)
    const data = await response.json()
    console.log(data)
    return data
  }
})

// export const answerQuestionsFromReport = async ({message, apiEndpoint}: AnswerQuestionsFromReportProps) => {
//   const response = await streamText({
//     model: openai,
//     prompt: `Answer the following questions using data from the provided API endpoint: ${message}`,
//     system: `You are a helpful assistant that answers questions by analyzing data from external sources. 
//     Use the provided API endpoint to fetch relevant information and provide accurate answers.`,
//     tools: {
//       fetchData: fetchData(apiEndpoint),
//     },
//     maxSteps: 10
//   })

//   return response
// }

export async function answerQuestionsFromReport({message, apiEndpoint}: AnswerQuestionsFromReportProps) {

  const stream = createStreamableValue();

  (async (apiEndpoint) => {
    const { textStream } = streamText({
      model: openai,
      prompt: message,
      system: `
        You are a helpful AI assistant that answers questions by analyzing data from external data sources and APIs. 
        Use the provided API endpoint to fetch relevant information and provide accurate answers.
        Generate the response only for the questions asked.
        Generate the response in the language of the question.
        By default, the response should be in Portuguese.
        If the question is in English, the response should be in English.
        The response should be concise and to the point.
        The response should be in Markdown format.
      `.trim(),
      tools: {
        fetchData: fetchData(apiEndpoint),
        // fetchData: tool({
        //   description: "Fetch data from the provided API endpoint",
        //   parameters: z.object({
        //     apiEndpoint: z.string(),
        //   }),
        //   execute: async ({ apiEndpoint}) => {
        //     const response = await fetch(apiEndpoint)
        //     const data = await response.json()
        //     console.log(data)
        //     return data
        //   }
        // }),
      },
      maxSteps: 10
    })

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })(apiEndpoint);

  return {
    newMessage: stream.value,
  };
}

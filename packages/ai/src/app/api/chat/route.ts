import { StreamingTextResponse } from 'ai';
import { answerQuestionsFromReport } from '@/actions/answer-questions-from-report';

export async function POST(req: Request) {
  const { messages, body } = await req.json();
  const { apiEndpoint } = body;
  
  // Get the last user message
  const lastMessage = messages[messages.length - 1];
  
  // Generate a response with the answerQuestionsFromReport function
  const response = await answerQuestionsFromReport({
    message: lastMessage.content,
    apiEndpoint,
  });
  
  // Return a streaming response
  // return new StreamingTextResponse(response);
} 
import { NextRequest, NextResponse } from "next/server";
import { answerQuestionsFromReport } from "@/actions/answer-questions-from-report";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { message } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const apiEndpoint = process.env.API_ENDPOINT;
    if (!apiEndpoint) {
      throw new Error("API_ENDPOINT environment variable is not set");
    }

    // Call the function with the message and apiEndpoint
    const response = await answerQuestionsFromReport({ message, apiEndpoint });

    // Return the response
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error answering questions from report:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 
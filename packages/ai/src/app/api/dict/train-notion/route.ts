import { NextRequest, NextResponse } from "next/server";
import { trainModelWithNotion } from "@/training/train-model-with-notion";

export const maxDuration = 300; // 5 minutes timeout for long-running operation

/**
 * API endpoint to train the model using Notion data
 * POST /api/train/notion
 */
export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NOTION_API_KEY) {
      return NextResponse.json(
        { error: "NOTION_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.NOTION_PAGE_ID) {
      return NextResponse.json(
        { error: "NOTION_PAGE_ID is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!process.env.POSTGRES_CONNECTION_STRING) {
      return NextResponse.json(
        { error: "POSTGRES_CONNECTION_STRING is not configured" },
        { status: 500 }
      );
    }

    // Optional: Get custom parameters from request body
    const body = await req.json().catch(() => ({}));
    const { tableName, chunkSize, chunkOverlap } = body;

    // Train the model
    const result = await trainModelWithNotion({
      notionApiKey: process.env.NOTION_API_KEY,
      notionPageId: process.env.NOTION_PAGE_ID,
      openaiApiKey: process.env.OPENAI_API_KEY,
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
      tableName,
      chunkSize,
      chunkOverlap,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in training model API:", error);
    return NextResponse.json(
      { error: "Failed to train model", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET method to check training status or provide info
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Use POST method to start training the model with Notion data",
  });
} 
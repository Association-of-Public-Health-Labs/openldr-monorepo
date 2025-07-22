import { NextRequest, NextResponse } from "next/server";
import { queryNotionVectorStore } from "@/training/train-model-with-notion";
import OpenAI from "openai";
import { executeSupervisor } from "@/agents-to-delete/supervisor";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API endpoint to perform semantic search on dictionary embeddings
 * GET /api/dict/search?query=your search query
 */
export async function GET(req: NextRequest) {
  try {
    // Get the query parameter from the URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query");
    
    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' parameter" },
        { status: 400 }
      );
    }
    
    // Validate environment variables
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
    
    // Optional: Get additional parameters
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const tableName = searchParams.get("tableName") || "dictionary_embeddings";
    
    // Perform the semantic search
    const results = await queryNotionVectorStore({
      query,
      openaiApiKey: process.env.OPENAI_API_KEY,
      connectionString: process.env.POSTGRES_CONNECTION_STRING,
      tableName,
      k: limit
    });
    
    // Generate AI completion based on search results
    const aiResponse = await generateAIResponse(query, results.sourceDocs);
    
    // Format the response
    return NextResponse.json({
      query,
      answer: aiResponse,
      results: results.sourceDocs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score: doc.metadata.score || null
      }))
    });
  } catch (error) {
    console.error("Error in semantic search API:", error);
    return NextResponse.json(
      { error: "Failed to perform search", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST method for more complex search queries with additional parameters
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { query, limit = 5, tableName = "dictionary_embeddings" } = body;
    
    // Validate query
    if (!query) {
      return NextResponse.json(
        { error: "Missing 'query' in request body" },
        { status: 400 }
      );
    }
    
    // Validate environment variables
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

    const response = await executeSupervisor({query});

    // // Perform the semantic search
    // const results = await queryNotionVectorStore({
    //   query,
    //   openaiApiKey: process.env.OPENAI_API_KEY,
    //   connectionString: process.env.POSTGRES_CONNECTION_STRING,
    //   tableName,
    //   k: limit,
    // });

    // Classify the query
    // const response = await identifyFacilityQuery({query});

    // // Generate the codes
    // const codes = await generateHealthcareDictionaryCodes({
    //   query, 
    //   endpoint: response.endpoint, 
    //   facilityType: response.facilityType, 
    //   facilityNames: response?.facilityNames.filter((name): name is string => name !== undefined)
    // });
    
    // console.log("codes", codes);

    // const { context, answer } = await querySemanticSearchForHealthFacilities({
    //   query: `
    //     ${facilityNames.join(", ")}
    //   `,
    // })

    // console.log("answer", context);

    // Generate AI completion based on search results
    // const aiResponse = await generateAIResponse(query, results);
    
    // Format the response
    return NextResponse.json({
      query,
      // answer: aiResponse,
      // results: results.map(doc => ({
      //   content: doc.pageContent,
      //   metadata: doc.metadata,
      //   score: doc.metadata.score || null
      // }))
    });
  } catch (error) {
    console.error("Error in semantic search API:", error);
    return NextResponse.json(
      { error: "Failed to perform search", details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Generate an AI response based on the search query and results
 */
async function generateAIResponse(query: string, searchResults: any[]): Promise<string> {
  try {
    // Extract content from search results
    const contextTexts = searchResults.map(doc => doc.pageContent).join("\n\n");
    
    // Create a prompt for the AI
    const prompt = `
      You are a helpful AI assistant with access to a knowledge base. 
      Answer the following question based on the provided context information.
      If the information needed is not present in the context, say "I don't have enough information to answer this question" rather than making up an answer.

      Question: ${query}

      Context information:
      ${contextTexts}

      Please provide a clear, concise, and accurate answer based on the context information provided.
    `;

    // Generate completion using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can use "gpt-4" for better results if available
      messages: [
        { role: "system", content: "You are a knowledgeable assistant that provides accurate information based on the given context." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 500, // Adjust as needed
    });

    // Extract and return the AI's response
    return completion.choices[0].message.content || "Unable to generate a response.";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Sorry, I encountered an error while generating a response.";
  }
}

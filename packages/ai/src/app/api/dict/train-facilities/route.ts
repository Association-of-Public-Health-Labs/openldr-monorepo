import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "langchain/document";

interface Facility {
  FacilityCode: string;
  FacilityNationalCode: string;
  FacilityName: string;
  ProvinceCode: string;
  ProvinceName: string;
  DistrictCode: string;
  DistrictName: string;
  HFStatus: number;
}

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json().catch(() => ({}));
    const { 
      apiUrl, 
      tableName = "facilities_embeddings"
    } = body;

    if (!apiUrl) {
      return NextResponse.json(
        { error: "API URL is required" },
        { status: 400 }
      );
    }

    // Fetch facilities data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch facilities data: ${response.statusText}`);
    }

    const facilities: Facility[] = await response.json();

    // Convert facilities to documents with structured content
    const documents = facilities.map((facility) => {
      // Create a readable text representation of the facility
      const content = `
        Health Facility: ${facility.FacilityName}
        Facility Code: ${facility.FacilityCode}
        National Code: ${facility.FacilityNationalCode}
        Province: ${facility.ProvinceName} (Code: ${facility.ProvinceCode})
        District: ${facility.DistrictName} (Code: ${facility.DistrictCode})
        Status: ${facility.HFStatus === 0 ? 'Active' : 'Inactive'}
      `.trim();

      return new Document({
        pageContent: content,
        metadata: {
          source: "health_facilities_api",
          facilityCode: facility.FacilityCode,
          nationalCode: facility.FacilityNationalCode,
          provinceCode: facility.ProvinceCode,
          districtCode: facility.DistrictCode,
          status: facility.HFStatus,
          createdAt: new Date().toISOString(),
        }
      });
    });

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Store embeddings in PGVector
    await PGVectorStore.fromDocuments(documents, embeddings, {
      postgresConnectionOptions: {
        connectionString: process.env.POSTGRES_CONNECTION_STRING,
      },
      tableName,
      columns: {
        idColumnName: 'id',
        vectorColumnName: 'embedding',
        contentColumnName: 'content',
        metadataColumnName: 'metadata',
      },
    });

    return NextResponse.json({
      success: true,
      count: documents.length,
      message: `Successfully generated embeddings for ${documents.length} facilities`,
      firstDocument: documents[0].pageContent, // For verification purposes
    });

  } catch (error) {
    console.error("Error generating facility embeddings:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate embeddings", 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Use POST method to generate embeddings from facilities API data",
  });
} 
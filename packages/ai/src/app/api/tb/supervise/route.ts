import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDataStreamResponse } from "ai";
import supervisor from "@/agents/agent-supervisor";
import agentGetDataFromApi from "@/agents/agent-get-data-from-api";
import agentGeneric from "@/agents/agent-generic";
import agentAnalyzeData from "@/agents/agent-analyze-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages, 
      endpoint, 
      facilityType, 
      agent, 
      description, 
      reportName, 
      facilities, 
      timeInterval,
      resume
    } = body;
    const query = messages?.[messages.length - 1]?.content;
    if (!query) {
      throw new Error("Query not found");
    }
    let agentToRun;
    
    if(!agent) {
      const supervisorResponse = await supervisor.execute({
        query, 
        endpoint, 
        facilityType, 
        messages, 
        dashboard: "tb"
      });
      agentToRun = supervisorResponse.agent;
    }
    else {
      agentToRun = agent || "agent-generic";
    }

    if(agentToRun === "agent-get-data-from-api") {
      const result = await agentGetDataFromApi.execute({
        query, 
        endpoint, 
        facilityType, 
        reportName, 
        description, 
        dashboard: "tb",
        messages
      });
      return result;
    } 
    else if(agentToRun === "agent-analyze-data") {
      return createDataStreamResponse({
        execute: async (dataStream) => {
          // Send the agent information as a separate JSON line
          dataStream.writeData(
            JSON.stringify({
              agent: "agent-analyze-data",
              data: {},
              endpoint,
              facilityType,
              type: "metadata"
            }) + '\n'
          );

          await agentAnalyzeData.execute({
            timeInterval,
            reportName,
            description,
            resume,
            messages,
            dashboard: "tb",
            dataStream
          })
      
        }
      });
    }
    else if(agentToRun === "agent-generate-excel-report") {
      // const result = await runAgentGenerateExcelReport({query, endpoint, facilityType});
      // return result;
      console.log("agentToRun", agentToRun);
      return {}
    }
    else {
      const result = await agentGeneric.execute({
        query, 
        reportName, 
        description, 
        dashboard: "tb",
        messages
      });
      return result;
    }
  } catch (error) {
    console.error("Error in supervise endpoint:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request parameters",
          details: error.issues
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500 }
    );
  }
}

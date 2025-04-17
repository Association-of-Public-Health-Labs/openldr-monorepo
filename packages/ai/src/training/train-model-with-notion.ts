import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "langchain/document";
import dotenv from "dotenv";
import { Client } from "@notionhq/client";
import OpenAI from 'openai';

dotenv.config();

// Define types for our function parameters
interface TrainModelWithNotionOptions {
  notionApiKey: string;
  notionPageId?: string;
  openaiApiKey: string;
  connectionString: string;
  tableName?: string;
  chunkSize?: number;
  chunkOverlap?: number;
}

/**
 * Trains a model by loading data from Notion, generating embeddings, and storing them in a PGVectorStore
 */
export async function trainModelWithNotion({
  notionApiKey,
  notionPageId,
  openaiApiKey,
  connectionString,
  tableName = "dictionary_embeddings",
  chunkSize = 1000,
  chunkOverlap = 200,
}: TrainModelWithNotionOptions): Promise<{ success: boolean; count: number }> {
  try {
    // Validate that we have either a page ID or database ID
    if (!notionPageId) {
      throw new Error("Either notionPageId or notionDatabaseId must be provided");
    }
    
    // Initialize Notion client
    const notion = new Client({ auth: notionApiKey });
    
    // Fetch content directly using Notion SDK
    if (notionPageId) {
      console.log(`Fetching content directly from Notion page: ${notionPageId}`);
      
      try {
        // Fetch the page blocks
        const blocks = await notion.blocks.children.list({ 
          block_id: notionPageId,
          page_size: 100 // Fetch more blocks
        });
        
        console.log(`Found ${blocks.results.length} blocks in the page`);
        
        if (blocks.results.length === 0) {
          console.warn("Warning: No blocks found in the Notion page. The page might be empty or inaccessible.");
          return { success: false, count: 0 };
        }
        
        // Extract text content from blocks
        const pageContent = await extractTextFromBlocks(blocks.results, notion);
        console.log(`Extracted ${pageContent.length} characters of content`);
        
        if (!pageContent || pageContent.length === 0) {
          console.warn("Warning: No text content could be extracted from the blocks.");
          return { success: false, count: 0 };
        }
        
        // Create a document from the extracted content
        const manualDoc = new Document({
          pageContent,
          metadata: {
            source: "notion",
            sourceId: notionPageId,
            createdAt: new Date().toISOString(),
          }
        });
        
        // Split the document
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize,
          chunkOverlap,
        });
        
        const splitDocs = await textSplitter.splitDocuments([manualDoc]);
        
        // Process and store
        const embeddings = new OpenAIEmbeddings({ openAIApiKey: openaiApiKey });
        
        await PGVectorStore.fromDocuments(splitDocs, embeddings, {
          postgresConnectionOptions: {
            connectionString: connectionString,
          },
          tableName,
          columns: {
            idColumnName: "id",
            vectorColumnName: "embedding",
            contentColumnName: "content",
            metadataColumnName: "metadata",
          },
        });
        
        console.log(`Successfully stored ${splitDocs.length} document chunks in PGVectorStore`);
        
        return {
          success: true,
          count: splitDocs.length,
        };
      } catch (error) {
        console.error("Error processing Notion page content:", error);
        throw new Error(`Failed to process Notion page content: ${error instanceof Error ? error.message : String(error)}`);
      }
    } 
    
    return { success: false, count: 0 };
  } catch (error) {
    console.error("Error training model with Notion:", error);
    throw error;
  }
}

// Helper function to extract text from Notion blocks
async function extractTextFromBlocks(blocks: any[], notion: Client): Promise<string> {
  let text = "";
  
  for (const block of blocks) {
    // Extract text based on block type
    if (block.type === "paragraph" && block.paragraph?.rich_text) {
      text += block.paragraph.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    } 
    else if (block.type === "heading_1" && block.heading_1?.rich_text) {
      text += "# " + block.heading_1.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    else if (block.type === "heading_2" && block.heading_2?.rich_text) {
      text += "## " + block.heading_2.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    else if (block.type === "heading_3" && block.heading_3?.rich_text) {
      text += "### " + block.heading_3.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    else if (block.type === "bulleted_list_item" && block.bulleted_list_item?.rich_text) {
      text += "• " + block.bulleted_list_item.rich_text.map((rt: any) => rt.plain_text).join("") + "\n";
    }
    else if (block.type === "numbered_list_item" && block.numbered_list_item?.rich_text) {
      text += "1. " + block.numbered_list_item.rich_text.map((rt: any) => rt.plain_text).join("") + "\n";
    }
    else if (block.type === "to_do" && block.to_do?.rich_text) {
      const checked = block.to_do.checked ? "[x]" : "[ ]";
      text += checked + " " + block.to_do.rich_text.map((rt: any) => rt.plain_text).join("") + "\n";
    }
    else if (block.type === "toggle" && block.toggle?.rich_text) {
      text += block.toggle.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    else if (block.type === "code" && block.code?.rich_text) {
      text += "```\n" + block.code.rich_text.map((rt: any) => rt.plain_text).join("") + "\n```\n\n";
    }
    else if (block.type === "quote" && block.quote?.rich_text) {
      text += "> " + block.quote.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    else if (block.type === "callout" && block.callout?.rich_text) {
      text += "> " + block.callout.rich_text.map((rt: any) => rt.plain_text).join("") + "\n\n";
    }
    
    // Handle nested blocks if they exist
    if (block.has_children) {
      try {
        const childBlocks = await notion.blocks.children.list({ block_id: block.id });
        if (childBlocks.results.length > 0) {
          const childText = await extractTextFromBlocks(childBlocks.results, notion);
          text += childText;
        }
      } catch (error) {
        console.error(`Error fetching child blocks for ${block.id}:`, error);
      }
    }
  }
  
  return text;
}

/**
 * Queries the vector database with a given query
 */
export async function queryNotionVectorStore({
  query,
  openaiApiKey,
  connectionString,
  tableName = "dictionary_embeddings",
  k = 5,
}: {
  query: string;
  openaiApiKey: string;
  connectionString: string;
  tableName?: string;
  k?: number;
  systemPrompt?: string;
}) {
  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const embeddings = new OpenAIEmbeddings({ 
      openAIApiKey: openaiApiKey, 
      modelName: "text-embedding-3-small", 
    });

    // Initialize vector store
    const vectorStore = await PGVectorStore.initialize(
      embeddings,
      {
        postgresConnectionOptions: {
          connectionString,
        },
        tableName,
        columns: {
          idColumnName: "id",
          vectorColumnName: "embedding",
          contentColumnName: "content",
          metadataColumnName: "metadata",
        },
      }
    );
    
    // Search for similar documents
    const similarDocs = await vectorStore.similaritySearch(query, k);
    
    // Prepare context from similar documents
    const context = similarDocs.map(doc => doc.pageContent).join('\n\n');

    // const prompt = `
    //   Você é um assistente de IA especializado em Sistemas de Informação Laboratorial que responde questoes sobre o dicionario do Repositorio de Dados Laboratoriais.

    //   Baseie suas respostas exclusivamente no contexto fornecido abaixo, extraído do dicionario de dados do Sistema de Informação Laboratorial.

    //   Se a resposta estiver no contexto, seja directo, claro e preciso. Use linguagem profissional e formal.

    //   Se não encontrar base suficiente no contexto, informe educadamente, por exemplo:

    //   "Lamento, mas não encontrei informações suficientes no contexto para responder a esta pergunta. Estou à disposição para ajudar com outro assunto."

    //   Formate bem sua resposta, utilizando listas, blocos de citação ou parágrafos curtos para facilitar a leitura.

    //   SEMPRE RESPONDA NA LINGUA CUJA PERGUNTA FOI FEITA.

    //   CONTEXTO:
    //   ${context}

    //   QUESTAO: ${query}

    //   RESPOSTA:
    // `;

    // console.log("prompt", prompt);
    
    // // Generate response using GPT-4
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     // {
    //     //   role: "system",
    //     //   content: systemPrompt
    //     // },
    //     {
    //       role: "user",
    //       content: prompt
    //     }
    //   ],
    //   temperature: 0.3,
    //   max_tokens: 500
    // });

    return {
      // answer: response.choices[0].message.content,
      answer: context,
      sourceDocs: similarDocs,
      context
    };
  } catch (error) {
    console.error("Error querying vector store:", error);
    throw error;
  }
}

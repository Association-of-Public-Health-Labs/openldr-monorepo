"use client"
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useFacilityStore } from "../store/facilityStore";
import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions } from "ai";
import { FacilitySelector } from "@repo/design_system";
import { BubbleMessage } from "@repo/design_system/atoms/chat/BubbleMessage";
import { useContextParamsStore } from '../store/contextParamsStore'
import { ChatInput as MuiChatInput } from "@repo/design_system/atoms/inputs/ChatInput"
import { extractMetadataFromContent } from "../lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatDataItem = {
  showFacilitiesSelector?: boolean;
  showLabsSelector?: boolean;
  timeInterval?: { startDate: string; endDate: string };
  [key: string]: any;
};

const endpoints = {
  tb: "http://localhost:3001/api/tb/supervise",
  vl: "http://localhost:3001/api/vl/supervise",
  eid: "http://localhost:3001/api/eid/supervise"
}


export function ChatPanel({ dashboard }: { dashboard: "tb" | "vl" | "eid" }) {
  const { contextParams } = useContextParamsStore()
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { provinces, districts, clinics, timeInterval, setProvinces, setDistricts, setClinics, setTimeInterval } = useFacilityStore();
  const [showFacilitySelector, setShowFacilitySelector] = useState(false);
  const [showLabSelector, setShowLabSelector] = useState(false);
  const [currentStreamedText, setCurrentStreamedText] = useState("");
  const [agentMetadata, setAgentMetadata] = useState<any>(null);
  const [isFacilitySelectorActive, setIsFacilitySelectorActive] = useState(false);

  const { append, messages, input: chatInput, handleInputChange: chatHandleInputChange, data, handleSubmit, setMessages } = useChat({
    api: endpoints[dashboard],  
    body: {
      endpoint: contextParams?.endpoint,
      facilityType: contextParams?.facilityType,
      reportName: contextParams?.reportName,
      description: contextParams?.description
    },
    onFinish: (message, options) => {
      if(data) {
        const dataItem = data?.[0];
        if(dataItem) {
          const parsedData = JSON.parse(dataItem as string); 

          if(parsedData?.type === "metadata") {
            setAgentMetadata(parsedData);
          } 

          if(parsedData?.reportName) {
            console.log("reportName", parsedData.reportName);
          }

          //////////////////
          if(parsedData?.showFacilitiesSelector) {
            setMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.id === message.id  // Use the specific message ID
                  ? { ...msg, showFacilitySelector: true }
                  : msg
              )
            );
          }
          //////////////////
        }
      }

      if ((data as ChatDataItem[])?.some(item => item?.showFacilitiesSelector)) {
        setShowFacilitySelector(true);  
      }
      if ((data as ChatDataItem[])?.some(item => item?.showLabsSelector)) {
        setShowLabSelector(true);
      }
      if ((data as ChatDataItem[])?.some(item => item?.timeInterval)) {
        const itemWithTimeInterval = (data as ChatDataItem[]).find(item => item?.timeInterval);
        if (itemWithTimeInterval?.timeInterval) {
          setTimeInterval(itemWithTimeInterval.timeInterval);
        }
      }
    },
  }); 

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [
    messages, 
    streamingContent
  ]); 

  // useEffect(() => {
  //   console.log("messages", messages);
  // }, [messages]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    for (const item of data) {
      if (typeof item === "string") {
        try {
          const parsed = JSON.parse(item);
  
          if (parsed?.type === "metadata") {
            setAgentMetadata(parsed);
          }
  
          // if (parsed?.showFacilitiesSelector && parsed?.index) {
          //   // setShowFacilitySelector(true);            
          //   setMessages((prevMessages) => 
          //     prevMessages.map((msg, index) => 
          //       index === parsed.index && msg.role === "assistant"
          //         ? { ...msg, showFacilitySelector: true }
          //         : { ...msg, showFacilitySelector: false }
          //     )
          //   );
          // }
          // else {
          //   setMessages((prevMessages) => 
          //     prevMessages.map((msg, index) => 
          //       index === prevMessages.length - 1 && msg.role === "assistant"
          //         ? { ...msg, showFacilitySelector: false }
          //         : msg
          //     )
          //   );
          // }
  
          if (parsed?.showLabsSelector) {
            setShowLabSelector(true);
          }
  
          if (parsed?.timeInterval) {
            setTimeInterval(parsed.timeInterval);
          }
  
        } catch (err) {
          // It's not JSON, ignore (likely assistant text)
        }
      }
    }
  }, [data]);

  const removeHtmlComments = (content: string) => {
    return content.replace(/<!--[\s\S]*?-->/g, '');
  };

  return (
    <div className="flex flex-col w-full h-full bg-yellow-100" style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    }}>
      <ScrollArea 
        className="flex-1 p-4 w-full" 
        style={{ 
          padding: "20px 20px 0px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          overflow: "auto",
        }}
      >
        <div 
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {messages?.map((message, index) => {
            const showFacilities = extractMetadataFromContent(message.content, "showfacilities");
            const nextMessage = messages[index + 1];
            const isUserWithoutAssistantReply = message.role === "user" && (!nextMessage || nextMessage.role !== "assistant");

            return (
              <div key={message.id}>
                {/* Render user message */}
                {message.role === "user" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    <BubbleMessage message={message.content} backgroundColor="background.paper" />
                  </div>
                )}

                {/* Streamed response (if this user message triggered it) */}
                {isUserWithoutAssistantReply && currentStreamedText && (
                  <div className="prose prose-violet opacity-70 italic">
                    <ReactMarkdown>{removeHtmlComments(currentStreamedText)}</ReactMarkdown>
                  </div>
                )}

                {/* Render assistant message */}
                {message.role === "assistant" && (
                  <div 
                    className="prose prose-violet" 
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {agentMetadata && ( 
                      <div style={{width: "auto"}} className="w-auto text-xs text-gray-400">
                        <p><strong>Agente:</strong> {agentMetadata.agent}</p>
                      </div>
                    )}
                    <ReactMarkdown>
                      {removeHtmlComments(message.content)}
                    </ReactMarkdown>
                    {showFacilities && (
                      <div>
                        <FacilitySelector 
                          onSelectionComplete={({facilityType, clinics, districts, provinces}) => {
                            let facilities: string[] = [];
                            if(facilityType === "province") {
                              facilities = provinces;
                            } else if(facilityType === "district") {
                              facilities = districts;
                            } else if(facilityType === "clinic") {
                              facilities = clinics;
                            }

                            const facilityMessage = `Pesquisar: ${facilities.join(', ')}`;

                            setIsFacilitySelectorActive(false);

                            append({
                              role: "user",
                              content: facilityMessage
                            }, {
                              body: {
                                facilities: facilities,
                                endpoint: contextParams?.endpoint,
                                facilityType: contextParams?.facilityType,
                                reportName: contextParams?.reportName,
                                description: contextParams?.description,
                                agent: "agent-get-data-from-api"
                              }
                            });
                          }}
                          onSelectorOpen={() => setIsFacilitySelectorActive(true)}
                          onSelectorClose={() => setIsFacilitySelectorActive(false)}
                        /> 
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {!isFacilitySelectorActive && (
        <div className="p-4 flex flex-col items-center gap-1" style={{ padding: "0px 20px 20px 20px" }}>
          <MuiChatInput 
            handleSubmit={handleSubmit} 
            chatInput={chatInput} 
            chatHandleInputChange={chatHandleInputChange}
          />
          <p className="text-sm text-gray-500">
            A IA pode cometer algumas falhas, por favor, verifique a informação.
          </p>
        </div>
      )}
    </div>
  )
}

export function ChatInput({handleSubmit, chatInput, chatHandleInputChange}: {
  handleSubmit: (event?: {
    preventDefault?: () => void;
  }, chatRequestOptions?: ChatRequestOptions) => void
  chatInput: string
  chatHandleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {

  return (
    <form
      onSubmit={handleSubmit}
      className="flex space-x-2 w-full border rounded-xl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 8,
        height: "auto",
      }}
    >
      <TextareaAutosize
        value={chatInput}
        onChange={chatHandleInputChange}
        placeholder="Pergunte qualquer coisa..."
        className="w-full resize-none active:outline-none outline-none"
        minRows={1}
        maxRows={8}
        style={{
          resize: "none",
          outline: "none",
        }}
        disabled={false}
      />
      {chatInput.trim() &&
        <div 
          className="flex flex-row w-full items-center justify-end"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Button className="rounded-full" type="submit" size="icon" disabled={false}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      }
    </form>
  );
}

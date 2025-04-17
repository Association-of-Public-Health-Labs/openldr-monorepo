"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FacilitySelector } from "@/components/facility-selector";
import { useFacilityStore } from "@/store/facilityStore";
import { useChat } from "@ai-sdk/react";
import { LabSelector } from "@/components/lab-selector";
import { getFacilitiesDataFromApi } from "@/actions/get-data-from-api";

// Define message type
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

export default function Home() {
  // const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { provinces, districts, clinics, timeInterval, setProvinces, setDistricts, setClinics, setTimeInterval } = useFacilityStore();
  const [showFacilitySelector, setShowFacilitySelector] = useState(false);
  const [showLabSelector, setShowLabSelector] = useState(false);
  const [labTypes, setLabTypes] = useState<string[]>([]);
  const [labs, setLabs] = useState<string[]>([]);
  
  const { append, messages, input: chatInput, handleInputChange: chatHandleInputChange, data, handleSubmit } = useChat({
    api: "/api/viralload/supervise",
    body: {
      endpoint: "/dict/districts",
      facilityType: "district"
    },
    onFinish: () => {
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
    onResponse: (response) => {
      console.log("response", response);
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
  }, [messages, streamingContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!input.trim()) return;

  //   // Add user message
  //   const userMessage: Message = { role: "user", content: input };
  //   setMessages((prev) => [...prev, userMessage]);
  //   setInput("");
  //   setIsLoading(true);
  //   setStreamingContent("");

  //   try {
  //     // Get streaming response from the action
  //     const { newMessage } = await answerQuestionsFromReport({
  //       message: input,
  //       apiEndpoint: "https://queue.openldr.org.mz/dict/districts",
  //     });

  //     // Add an initial empty assistant message
  //     setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      
  //     let textContent = "";
      
  //     for await (const delta of readStreamableValue(newMessage)) {
  //       textContent = `${textContent}${delta}`;
        
  //       // Update the last message (which is the assistant"s response)
  //       setMessages((prev) => {
  //         const newMessages = [...prev];
  //         newMessages[newMessages.length - 1] = { 
  //           role: "assistant", 
  //           content: textContent 
  //         };
  //         return newMessages;
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error getting response:", error);
  //     setMessages((prev) => [
  //       ...prev,
  //       { role: "assistant", content: "Sorry, there was an error processing your request." },
  //     ]);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      setShowFacilitySelector(false); // Reset selector visibility
      
      const userMessage: Message = { role: "user", content: input };
      // setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const response = await fetch("/api/viralload/supervise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: input, 
          endpoint: "/dict/districts", 
          facilityType: "district" 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      // The response will be handled by useChat hook automatically
      
    } catch (error) {
      console.error("Error:", error);
      // setMessages((prev) => [
      //   ...prev,
      //   { role: "assistant", content: "Sorry, there was an error processing your request." }
      // ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilitySelection = async ({ provinces, districts, clinics }: { provinces: string[], districts: string[], clinics: string[] }) => {
    setProvinces(provinces);
    setDistricts(districts);
    setClinics(clinics);
    setShowFacilitySelector(false);
    
    // Continue with the query processing using selected facilities
    const data = await getFacilitiesDataFromApi({
      endpoint: "https://queue.openldr.org.mz/viralload/clinic/samples_by_test_reason",
      timeInterval: { 
        startDate: timeInterval.startDate, 
        endDate: timeInterval.endDate 
      },
      type: "district",
      facilities: districts,
    });

    // Extract keys from the first object in the array (assuming it's an array of objects)
    if (Array.isArray(data) && data.length > 0) {
      const keys = Object.keys(data[0]);
      const description = `The data contains the following fields: ${keys.join(', ')}`;
      
      // Append the description to the chat
      append({
        role: "assistant",
        content: description
      });
    }
  };

  const handleLabSelection = ({ labTypes, labs }: { labTypes: string[], labs: string[] }) => {
    setLabTypes(labTypes);
    setLabs(labs);
    setShowLabSelector(false);

  };  

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 p-4">
      <Card className="flex flex-col h-full">

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex flex-col">
                {message.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start max-w-[80%]">
                    <div className="prose dark:prose-invert">
                      {/* @ts-ignore */}
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {streamingContent && (
              <div className="flex justify-start max-w-[80%]">
                <div className="prose dark:prose-invert">
                  {/* @ts-ignore */}
                  <ReactMarkdown>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            {showFacilitySelector && (
              <div className="flex justify-center w-full py-4">
                <FacilitySelector 
                  onSelectionComplete={handleFacilitySelection}
                />
              </div>
            )}
            {showLabSelector && (
              <div className="flex justify-center w-full py-4">
                <LabSelector 
                  onSelectionComplete={handleLabSelection}
                />
              </div>
            )}
            {isLoading && !showFacilitySelector && (
              <div className="flex justify-start max-w-[80%]">
                <div className="text-gray-500">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={chatInput}
              onChange={chatHandleInputChange}
              placeholder="Pergunte qualquer coisa..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

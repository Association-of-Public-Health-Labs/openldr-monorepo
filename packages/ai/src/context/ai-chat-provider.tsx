"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { Send } from "lucide-react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable"
import { ScrollArea } from "../components/ui/scroll-area"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import ReactMarkdown from "react-markdown"

type AIChatContextType = {
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  isOpen: boolean
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

export const useAIChat = () => {
  const context = useContext(AIChatContext)
  if (!context) throw new Error("useAIChat must be used within AIChatProvider")
  return context
}

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const openChat = () => setIsOpen(true)
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen((prev) => !prev)

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      {/* Main Content Panel */}
      <ResizablePanel minSize={30} defaultSize={80} maxSize={85}>
        {children}
      </ResizablePanel>
      <ResizableHandle />
      {/* Chat Panel */}
      <ResizablePanel minSize={15} defaultSize={20} className="h-full flex flex-col">
        <ScrollArea className="flex-1 p-4 bg-red-100 w-full">
          <div className="flex flex-col space-y-4">
            dsfvcedwsvg
          </div>
        </ScrollArea>
        
        <div className="w-full">
          <form onSubmit={() =>   {}} className="flex space-x-2">
            <Input
              value={""}
              onChange={() => {}}
              placeholder="Pergunte qualquer coisa..."
              className="flex-1 w-full"
              disabled={false}
            />
            {/* <Button type="submit" size="icon" disabled={false}>
              <Send className="h-4 w-4" />
            </Button> */}
          </form>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

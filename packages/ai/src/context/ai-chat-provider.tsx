"use client"

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable"
import { ChatPanel } from "../components/chat-panel"

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
      <ResizablePanel minSize={30} defaultSize={75} maxSize={85}>
        {children}
      </ResizablePanel>
      <ResizableHandle />
      {/* Chat Panel */}
      <ResizablePanel minSize={15} defaultSize={25} className="h-full flex flex-col">
        <ChatPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
"use client"

import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/ui/resizable"
import { ChatPanel } from "../components/chat-panel"
import { useContextParamsStore } from '../store/contextParamsStore'
import { cn } from "../lib/utils"

export type ContextParams = {
  endpoint?: string
  reportName?: string
  description?: string
  facilityType?: string
  report?: string
  data?: any[]
}

interface AIChatContextType {
  openChat: (params: ContextParams) => void
  closeChat: () => void
  toggleChat: () => void
  isOpen: boolean
  contextParams: ContextParams | undefined
  setContextParams: (params: ContextParams) => void
  onPanelResize: (sizes: { left: number; right: number }) => void
  panelSizes: { left: number; right: number }
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

export const useAIChat = (initialParams?: ContextParams) => {
  const context = useContext(AIChatContext)
  const { setContextParams } = useContextParamsStore()
  
  if (!context) throw new Error("useAIChat must be used within AIChatProvider")

  // useEffect(() => {
  //   if (initialParams && !context.contextParams) {
  //     console.log("initialParams", initialParams);  
  //     setContextParams(initialParams)
  //   }
  // }, [])

  return context
}

export function AIChatProvider({ children, dashboard, panelSizes: initialPanelSizes, onPanelResize }: { 
  children: ReactNode,
  dashboard: "tb" | "vl" | "eid",
  panelSizes: { left: number; right: number },
  onPanelResize: (sizes: { left: number; right: number }) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [panelSizes, setPanelSizes] = useState(initialPanelSizes)
  const { contextParams, setContextParams } = useContextParamsStore()

  const openChat = (params: ContextParams) => {
    setContextParams(params)
    setIsOpen(true)
  }
  const closeChat = () => setIsOpen(false)
  const toggleChat = () => setIsOpen((prev) => !prev)

  const currentSizes = useRef({ left: 75, right: 25 })

  const debouncedResize = useCallback((sizes: { left: number; right: number }) => {
    currentSizes.current = sizes
    // Only update state after resize is complete
    requestAnimationFrame(() => {
      setPanelSizes(sizes)
    })
  }, [])
  
  const value: AIChatContextType = {
    openChat,
    closeChat,
    toggleChat,
    isOpen,
    contextParams,
    setContextParams,
    onPanelResize,
    panelSizes
  }

  return (
    <AIChatContext.Provider value={value}>
      <ResizablePanelGroup 
        direction="horizontal" 
        className="w-full h-full fixed inset-0" 
        style={{
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
        }}
        // onLayout={(sizes) => {
        //   if (sizes.length === 2) {
        //     onPanelResize({
        //       left: sizes[0],
        //       right: sizes[1]
        //     })
        //   }
        // }}
      >
        {/* Main Content Panel */}
        <ResizablePanel 
          minSize={50} 
          defaultSize={isOpen ? panelSizes.left : 100} 
          maxSize={isOpen ? 85 : 100} 
          style={{position: "relative"}}
        >
          {/* @ts-ignore */}
          {children}
        </ResizablePanel>
        {isOpen && (
          <ResizableHandle 
            style={{
              width: "0px",
              backgroundColor: "transparent",
              borderLeft: "0.1px solid #f4f4f5",
              borderRight: "0.1px solid transparent",
            }}
          />
        )}
        {/* Chat Panel */}
        <ResizablePanel 
          minSize={15} 
          defaultSize={panelSizes.right} 
          className={cn(
            "h-full flex flex-col transition-all duration-300",
            !isOpen && "w-0 min-w-0"
          )}
          style={{
            display: isOpen ? 'flex' : 'none',
            width: isOpen ? 'auto' : '0',
            minWidth: isOpen ? 'auto' : '0'
          }}
        >
          <ChatPanel dashboard={dashboard} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AIChatContext.Provider>
  )
}
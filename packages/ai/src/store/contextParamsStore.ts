import { create } from "zustand"
import { ContextParams } from "../context/ai-chat-provider"

interface ContextParamsState {
  contextParams: ContextParams | undefined
  setContextParams: (params: ContextParams) => void
}

export const useContextParamsStore = create<ContextParamsState>((set) => ({
  contextParams: undefined,
  setContextParams: (params) => set({ contextParams: params }),
}))
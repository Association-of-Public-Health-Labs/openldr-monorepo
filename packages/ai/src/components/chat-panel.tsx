"use client"
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

export function ChatPanel() {
  return (
    <div className="flex flex-col w-full h-full ">
      <ScrollArea className="flex-1 p-4 w-full" style={{ padding: 10 }}>

      </ScrollArea>
      <div className="p-4 flex flex-col items-center gap-1" style={{ padding: 20 }}>
        <ChatInput />
        <p className="text-sm text-gray-500">
          A IA pode cometer algumas falhas, por favor, verigfique a informação.
        </p>
      </div>
    </div>
  )
}

export function ChatInput() {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={() => {}}
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
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Pergunte qualquer coisa..."
        className="w-full resize-none active:outline-none outline-none"
        minRows={1}
        maxRows={8} // Adjust as needed
        style={{
          resize: "none",
          outline: "none",
        }}
        disabled={false}
      />
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
    </form>
  );
}

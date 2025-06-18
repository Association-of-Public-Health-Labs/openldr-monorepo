import { Box, Button } from "@mui/material";
import { Send } from "lucide-react";
import {useTheme} from "@mui/material/styles";
import TextareaAutosize from "react-textarea-autosize";

interface ChatInputProps {
  handleSubmit: (event?: {
    preventDefault?: () => void;
  }) => void;
  chatInput: string;
  chatHandleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ChatInput({
  handleSubmit,
  chatInput = '',
  chatHandleInputChange
}: ChatInputProps) {
  const hasInput = chatInput?.trim()?.length > 0;
  const theme = useTheme(); 

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
      }}
    >
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 8,
          gap: 1,
          height: "auto",
          width: "100%",
          backgroundColor: "background.paper",
          padding: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextareaAutosize
          value={chatInput || ''}
          onChange={chatHandleInputChange}
          placeholder="Pergunte qualquer coisa..."
          className="w-full resize-none active:outline-none outline-none"
          minRows={1}
          maxRows={8}
          style={{
            resize: "none",
            outline: "none",
            width: "100%",
            border: "none",
            backgroundColor: "transparent",
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            color: theme.palette.text.primary,
            lineHeight: 1.5,
          }}
          disabled={false}
        />
      {hasInput && (
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
          <Button  
            type="submit" 
            disabled={false}
            sx={{
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
              color: "white",
              padding: 1,
              width: 40,
              height: 40,
              minWidth: 40,
              minHeight: 40,
            }}
          >
            <Send style={{width: 20, height: 20}} />
          </Button>
        </div>
       )} 
      </Box>
    </form>
  );
}

import { Box, Typography } from "@mui/material";

interface BubbleMessageProps {
  message: string;
  maxWidth?: string;
  backgroundColor?: string;
}

export function BubbleMessage({ 
  message, 
  maxWidth = "70%", 
  backgroundColor = "secondary.main" 
}: BubbleMessageProps) {
  return (
    <Box sx={{
      backgroundColor,
      borderRadius: "20px",
      padding: "12px 16px",
      display: "inline-block",
      maxWidth,
      width: "fit-content",
      wordWrap: "break-word",
    }}>
      <Typography 
        variant="body1" 
        sx={{
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
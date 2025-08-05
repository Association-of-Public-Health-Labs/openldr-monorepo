import { Box } from "@mui/material";

export function ColorDisplay({ color }: { color: string }) {
  return (
    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
  )
}
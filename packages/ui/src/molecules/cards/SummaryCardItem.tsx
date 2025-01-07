import React, {ReactNode} from "react";
import { Box, Typography } from "@mui/material";
import hexToRgba from "hex-to-rgba";

export type Props = {
  title: string;
  subtitle: string | number;
  value: string | number;
  icon: ReactNode;
  color: string;
}

export function SummaryCardItem ({title, subtitle, value, icon, color}: Props) {
  return (
    <Box 
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: hexToRgba(color, "0.09"),
        // width: "40px",
        // height: "40px",
        padding: 1,
        borderRadius: "50%",
        color: color
      }}>
        {icon}
      </Box>
      <Box 
        sx={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Typography 
          variant="h6"
          sx={{
            color: "text.primary",
            fontWeight: "medium",
            fontSize: "16px"
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: "text.primary",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {subtitle}
        </Typography>
        <Typography 
          variant="h6"
          sx={{
            color: color,
            fontWeight: "bold",
            fontSize: "14px"
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  )
}
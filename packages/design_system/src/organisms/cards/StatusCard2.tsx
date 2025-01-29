import React, {ReactNode} from "react";
import {Box, Typography} from "@mui/material"; 

export type Props = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  value?: number | string | ReactNode;
}

export function StatusCard2 (props: Props) {
  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        borderRadius: "16px",
        boxShadow: 1,
        padding: 2,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start"
      }}>
        <Typography 
            fontSize={28}
            sx={{
              fontWeight: "bold",
              padding: 0,
              margin: 0,
              color: "text.primary",
              lineHeight: 1,
            }}
        >
          {props?.value}
        </Typography>
        <Typography sx={{
          fontWeight: "medium",
          color: "text.primary",
          fontSize: 13
        }}>
          {props?.title}
        </Typography>
      </Box>
      <Box sx={{height: 70}}/>
      <Box
         sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
          flex: 1,
          gap: 1,
          position: "absolute",
          width: "100%",
          height: 70,
          left: 0,
          bottom: 5
         }}
      >
        {props?.children}
      </Box>
    </Box>
  )
}
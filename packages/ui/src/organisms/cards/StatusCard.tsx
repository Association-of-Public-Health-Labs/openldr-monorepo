import React, {ReactNode} from "react";
import {Box, Typography, BoxProps} from "@mui/material"; 

export type Props = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  value?: number | string | ReactNode;
  containerProps?: BoxProps;
}

export function StatusCard (props: Props) {
  return (
    <Box
      {...props?.containerProps}
      sx={{
        backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
        borderRadius: "16px",
        boxShadow: 1,
        padding: 2,
        ...props?.containerProps?.sx
      }}
    >
      <Typography sx={{
        fontWeight: "medium",
        color: "text.primary"
      }}>
        {props?.title}
      </Typography>
      <Box
         sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 0,
          flex: 1,
          gap: 1,
         }}
      >
        <Typography 
          fontSize={28}
          sx={{
            fontWeight: "bold",
            padding: 0,
            margin: 0,
            color: "text.primary"
          }}
        >
          {props?.value}
        </Typography>
        <Box sx={{flex: 1, height: "100%"}}>
          {props?.children}
        </Box>
      </Box>
      <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
      }}>
        <Typography fontSize="0.83rem" variant="h6" sx={{
          color: "text.disabled",
          fontWeight: 600,
        }}>
          {props?.subtitle}
        </Typography>
      </Box>
    </Box>
  )
}
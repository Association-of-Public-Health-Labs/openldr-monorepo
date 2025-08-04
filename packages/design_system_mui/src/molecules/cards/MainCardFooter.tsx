import React from "react";
import {Box, BoxProps} from "@mui/material";

export type MainCardFooterProps = {
  footerProps: BoxProps;
}

export function MainCardFooter({footerProps}: MainCardFooterProps) {
  return (
    <Box 
    {...footerProps}    
    sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      padding: 0,
      height: "30px",
      ...footerProps?.sx
    }}
    >
      
    </Box>
  );
}
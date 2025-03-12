import React, { Fragment } from "react";
import { Box, BoxProps } from "@mui/material";
import {Button} from "../../atoms/inputs/Button";

export interface Props {
  handleSubmit?: () => void;
  containerStyles?: BoxProps;
}

export function SelectFacilitiesFooter ({handleSubmit, containerStyles}: Props) {

  return (
    <Box sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
      {...containerStyles}
    >
      <Fragment/>
      <Button 
        variant="contained"
        sx={{
          color: "white",
          width: "170px",
          fontWeight: 600
        }}
        onClick={() => handleSubmit && handleSubmit()}
      >
        Aplicar
      </Button>
    </Box>
  )
}
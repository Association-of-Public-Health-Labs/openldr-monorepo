import React, { useState } from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import {IoClose} from "react-icons/io5";

export interface LabsStateProps {
  all: boolean;
  conventional: boolean;
  poc: boolean;
}

export interface SelectLabsHeaderProps { 
  handleChangeFacility?: (labsStates: LabsStateProps) => void;
  containerProps?: BoxProps,
  labsStates?: LabsStateProps,
  handleClosePopup: () => void;
  labType?: "conventional" | "poc";
}

export function SelectLabsHeader({
  handleChangeFacility,
  containerProps,
  labsStates,
  handleClosePopup,
  labType
}: SelectLabsHeaderProps) {
  const [checked, setChecked] = useState<LabsStateProps>(labsStates || {
    all: false, 
    conventional: true, 
    poc: false
  });

  const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      all: event.target.checked, 
      conventional: event.target.checked, 
      poc: event.target.checked
    });
    handleChangeFacility && handleChangeFacility({
      all: event.target.checked, 
      conventional: event.target.checked, 
      poc: event.target.checked
    });
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      all: checked.all, 
      conventional: event.target.checked, 
      poc: checked.poc
    });
    handleChangeFacility && handleChangeFacility({
      all: checked.all, 
      conventional: event.target.checked, 
      poc: checked.poc
    });
  };

  const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked({
      all: checked.all, 
      conventional: checked.conventional, 
      poc: event.target.checked
    });
    handleChangeFacility && handleChangeFacility({
      all: checked.all, 
      conventional: checked.conventional, 
      poc: event.target.checked
    });
  };
  
  return (
    <Box
      {...containerProps}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 0,
        ...containerProps?.sx
      }}
    >
      <Box
        sx={{
          display: labType ? "none" : "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          label="Todos"
          sx={{
            color: "text.primary",
          }} 
          control={
            <Checkbox
              checked={checked.conventional && checked.poc}
              indeterminate={checked.conventional !== checked.poc}
              size="small"
              onChange={handleChange1}
            />
          }
        />
        <FormControlLabel
          label="Convencional"
          sx={{color: "text.primary"}} 
          control={<Checkbox checked={checked.conventional} size="small" onChange={handleChange2} />}
        />
        <FormControlLabel
          label="POC"
          sx={{color: "text.primary"}} 
          control={<Checkbox checked={checked.poc} size="small" onChange={handleChange3} />}
        />
      </Box>
      <Typography fontSize={16} variant="h6" sx={{
        margin: 0,
        padding: 0,
        color: "text.primary",
        display: labType ? "block" : "none",
        fontWeight: 600
      }}>
        Filtrar por Laboratório
      </Typography>
      <IconButton aria-label="close" onClick={() => handleClosePopup()}>
        <IoClose />
      </IconButton>
    </Box>
  )
}
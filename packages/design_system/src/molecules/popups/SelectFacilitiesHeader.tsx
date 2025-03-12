import React, {useState} from "react";
import { Box, BoxProps, Typography } from "@mui/material";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import {IoClose} from "react-icons/io5";

export interface Props { 
  handleChangeFacility: (facilityType: "province" | "district" | "clinic") => void;
  containerProps: BoxProps,
  handleClosePopup: () => void;
}

export function SelectFacilitiesHeader({
  handleChangeFacility,
  containerProps,
  handleClosePopup
}: Props) {
  const [facilityType, setFacilityType] = useState<"province" | "district" | "clinic">("province");
  
  return (
    <Box
      {...containerProps}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        margin: 0,
        ...containerProps?.sx
      }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        justifyContent: "center",
        margin: 0,
      }}>
        <Typography fontSize={16} variant="h6" sx={{
          margin: 0,
          padding: 0,
          color: "text.primary",
          fontWeight: 600
        }}>
          Filtrar por Unidade Sanitária
        </Typography>
        <FormControl
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "auto",
          }}
        >
          <RadioGroup
            row
            aria-labelledby="demo-row-radio-buttons-group-label"
            name="row-radio-buttons-group"
            defaultValue={facilityType}
          >
            <FormControlLabel sx={{color: "text.primary"}} value="province" control={<Radio onChange={(e) => handleChangeFacility("province")} size="small" />} label={"Provincia"} />
            <FormControlLabel sx={{color: "text.primary", fontWeight: 600 }} value="district" control={<Radio onChange={(e) => handleChangeFacility("district")} size="small" />} label={"Distrito"} />
            <FormControlLabel sx={{color: "text.primary", fontWeight: 600}}  value="clinic" control={<Radio onChange={(e) => handleChangeFacility("clinic")} size="small" />} label={"Unidade Sanitária"} />
          </RadioGroup>
        </FormControl>
      </Box>
      <IconButton aria-label="close" onClick={() => handleClosePopup()}>
        <IoClose />
      </IconButton>
    </Box>
  )
}
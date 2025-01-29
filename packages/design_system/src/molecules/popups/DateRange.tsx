import React, {useState, useEffect} from "react";
import { Box } from "@mui/material";
import moment from "moment";
import {DatePicker} from "../../atoms/pickers/Date";

export interface Props {
  onChange?: (value: [string, string]) => void;
  initialDates?: [string, string];
}

export function DateRange({onChange, initialDates}: Props) {
  const [dates, setDates] = useState<Date[]>( [
      new Date((initialDates?.length === 2) ? initialDates[0] : moment().subtract("year",1).format("YYYY-MM-DD")),
      new Date((initialDates?.length === 2) ? initialDates[1] : moment().format("YYYY-MM-DD")) 
    ]
  );

  useEffect(() => {
    if(onChange) {
      onChange([moment(dates[0]).format("YYYY-MM-DD"), moment(dates[1]).format("YYYY-MM-DD")]);
    }
  }, [dates]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 3,
      }}
    >
      {/* @ts-ignore */}
      <DatePicker 
        label={"Data de Inicio"}
        minDate={new Date("2000-01-01")}
        value={dates[0]}
        onChange={(newValue: any) => {
          setDates([newValue, dates[1]]);
        }}
        InputProps={{
          style:{
            width: "100%"
          }
        }}
      />
      {/* @ts-ignore */}
      <DatePicker 
        label={"Data de Fim"}
        value={dates[1]}
        minDate={new Date("2000-01-01")}
        onChange={(newValue: any) => {
          setDates([dates[0], newValue]);
        }}
        InputProps={{
          style:{
            width: "100%"
          }
        }}
      />
    </Box>
  );
}
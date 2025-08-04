import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import moment from "moment";
import {DateRangeMolecule} from "../../molecules/popups/DateRange";
import {Button} from "../../atoms/inputs/Button";
import { IoClose } from "react-icons/io5";

export type DateRangeProps = {
  open: boolean;
  initialDates?: [string, string],
  handleSubmit?: (dates: [string, string]) => void,
  onClose?: () => void
}


export function DateRange({open=false, initialDates, handleSubmit, onClose}: DateRangeProps) {
  const [openModal, setOpenModal] = useState(open);
  const [dates, setDates] = useState<[string, string]>([
    (initialDates?.length === 2) ? initialDates[0] : moment().subtract("year",1).format("YYYY-MM-DD"),
    (initialDates?.length === 2) ? initialDates[1] : moment().format("YYYY-MM-DD") 
  ]
);

  useEffect(() => {
    setOpenModal(open);
  }, [open]);

  return (
    <Box 
      sx={{
        display: openModal ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.5)",
        top: 0,
        left: 0,
      }}
    >
      <Box sx={{
        display: openModal ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.paper",
        maxWidth: "300px",
        padding: "10px 25px 20px 25px",
        // padding: 2,
        position: "relative",
        gap: 3,
        borderRadius: "16px"
      }}>
        <Box sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%"
        }}>
          <Typography fontSize={16} variant="h6" sx={{
            width: "100%",
            margin: 0,
            padding: 0,
            color: "text.primary",
            fontWeight: 600
          }}>
            Selecione o Intervalo
          </Typography>
          <IconButton 
            aria-label="close" 
            onClick={() => {
              onClose && onClose();
              setOpenModal(false)
            }}
          >
            <IoClose />
          </IconButton>
        </Box>
        
        <DateRangeMolecule 
          onChange={(values) => setDates(values)} 
          initialDates={initialDates}
        />
        <Button 
          variant="contained"
          sx={{
            color: "white",
            width: "100%",
            fontWeight: 600
          }}
          onClick={() => {
            handleSubmit && handleSubmit(dates)
            onClose && onClose();
            setOpenModal(false)
          }}
        >
          Aplicar
        </Button>
      </Box>
    </Box>
  )
}
import React, {useState, useEffect} from "react";
import {Box} from "@mui/material";
import moment from "moment";
import {SelectLabsHeader, LabsStateProps} from "../../molecules/popups/SelectLabsHeader";
import {SelectFacilitiesFooter} from "../../molecules/popups/SelectFacilitiesFooter";
import {DateRangeMolecule} from "../../molecules/popups/DateRange";
import {SelectPicker, SelectPickerOptionsProps} from "../../atoms/pickers/SelectPicker";
import { FacilitiesProps } from "../../types/facilities";

export interface LabsPopupProps {
  open: boolean;
  facilities: FacilitiesProps
  handleSubmit: (
    labs: SelectPickerOptionsProps[], 
    dates: [string, string], 
    labType: "conventional" | "poc" | "all"
  ) => void;
  initialDates?: [string, string];
  onClose?: () => void;
  labType?: "conventional" | "poc"
}

export function LabsPopup({open, facilities, handleSubmit, initialDates, onClose, labType}: LabsPopupProps) {
  const [openPopup, setOpenPopup] = useState(open);
  const [dates, setDates] = useState<[string, string]>([
    (initialDates?.length === 2) ? initialDates[0] : moment().subtract("year",1).format("YYYY-MM-DD"),
    (initialDates?.length === 2) ? initialDates[1] : moment().format("YYYY-MM-DD") 
  ]);
  const [labsStates, setLabsStates] = useState<LabsStateProps>({
    all: false,
    conventional: labType === "conventional",
    poc: labType === "poc"
  });
  const {labs, pocs} = facilities;
  const conventional = Array.isArray(labs) ? labs.map(lab => ({value: lab.LabCode, label: lab.LabName})) : [];
  const poc = Array.isArray(pocs) ? pocs.map(poc => ({value: poc.DisaPocCode, label: poc.DisaPocName})) : [];
  const [selectedLabs, setSelectedLabs] = useState([]);
  const [labsOptions, setLabsOptions] = useState<SelectPickerOptionsProps[]>([]);

  useEffect(() => {
    setOpenPopup(open);
    async function fetchLabs() {
      const labs = await fetch(`https://dev.openldr.org.mz/dict/facilities/`)
      const labsData = await labs.json()
      console.log('labsData', labsData)
      setLabsOptions(labsData.map((lab: any) => ({
        value: lab.FacilityCode,
        label: lab.FacilityName,
        district: null,
        province: null
      })))
    }
    fetchLabs()
  }, [open])

  // useEffect(() => {
  //   setLabsStates(lab => ({
  //     ...lab,
  //     conventional: labType === "conventional",
  //     poc: labType === "poc"
  //   }))
  // },[labType])

  // useEffect(() => {
  //   async function fetchLabs() {
  //     const labs = await fetch(`https://dev.openldr.org.mz/dict/facilities/`)
  //     const labsData = await labs.json()
  //     console.log('labsData', labsData)
  //   }
  //   fetchLabs()
  // }, [])

  const handleClose = () => {
    setOpenPopup(false);
    onClose && onClose();
  };

  return (
    <Box 
      sx={{
        display: openPopup ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        zIndex: 99,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <Box 
        sx={{
          display: openPopup ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
          padding: 2,
          position: "relative",
          gap: 3,
          borderRadius: "16px",
          width: {xs: "90%", sm: "80%", lg: "50%", xl: "50%"}
        }}
      >
          <SelectLabsHeader
            containerProps={{
              width: "100%"
            }}
            handleChangeFacility={(states) => setLabsStates(states)}
            labsStates={labsStates}
            handleClosePopup={() => handleClose()}
            labType={labType}
          />
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
              gap: { xs: 2, md: 2 },
              width: '100%'
            }}
          >
            <Box sx={{ width: '100%' }}>
              <SelectPicker
                width="100%"
                placeholder={"Selecione os Laboratórios"}
                options={[
                  // ...(labsStates.conventional ? conventional : []), 
                  // ...(labsStates.poc ? poc : [])
                  // {
                  //   value: string | undefined;
                  //   label: string;
                  //   color?: string;
                  //   isFixed?: boolean;
                  //   isDisabled?: boolean;
                  //   district?: string;
                  //   province?: string;
                  // }
                  ...labsOptions
                ]}
                onChange={(values: any) => setSelectedLabs(values)}
              />
            </Box>
            <Box>
              <DateRangeMolecule 
                onChange={(values) => setDates(values)} 
                initialDates={initialDates}
              />
            </Box>
          </Box>
          <SelectFacilitiesFooter 
            containerStyles={{
              width: "100%"
            }}
            handleSubmit={() => {
              handleSubmit(
                selectedLabs?.map((lab: any) => lab.label), 
                dates, 
                labsStates.all ? 
                  "all" : 
                  (labsStates.conventional ? "conventional" : "poc")
              );
              handleClose();
            }}
          />
      </Box>
    </Box>
  );
}
import React, {useState, useEffect, useContext} from "react";
import {Box, Grid} from "@mui/material";
import moment from "moment";

import {SelectFacilitiesHeader} from "../../molecules/popups/SelectFacilitiesHeader";
import {SelectFacilitiesFooter} from "../../molecules/popups/SelectFacilitiesFooter";
import {SelectFacilities} from "../../molecules/popups/SelectFacilities";
import {DateRange} from "../../molecules/popups/DateRange";
import {optionsProps} from "../../atoms/pickers/Select";
import { FacilitiesProps } from "../../types/facilities";

export interface Props {
  open: boolean;
  facilities: FacilitiesProps
  handleSubmit: (
    facilities: optionsProps[], 
    facilityType: "province" | "district" | "clinic", 
    dates: [string, string]
  ) => void;
  initialDates?: [string, string];
  onClose?: () => void,
  defaultFacilities?:  any[],
  defaultFacilityType?: "province" | "district" | "clinic",
  isMulti?: boolean
}

export function FacilitiesPopup({open, facilities, handleSubmit, initialDates, onClose, defaultFacilities, defaultFacilityType, isMulti}: Props) {
  const [openModal, setOpenModal] = useState(open);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [facilityType, setFacilityType] = useState<"province" | "district" | "clinic">(defaultFacilityType || "province");
  const [dates, setDates] = useState<[string, string]>([
      (initialDates?.length === 2) ? initialDates[0] : moment().subtract("year",1).format("YYYY-MM-DD"),
      (initialDates?.length === 2) ? initialDates[1] : moment().format("YYYY-MM-DD") 
    ]
  );

  const {clinics, districts} = facilities;

  const formatedClinics = Array.isArray(clinics) ? clinics?.map(clinic => ({
    value: clinic.FacilityName, 
    label: clinic.FacilityName,
    district: clinic.DistrictName,
    province: clinic.ProvinceName
  })) : [];

  const formatedDistricts = Array.isArray(districts) ? districts?.map(district => ({
    value: district.DistrictCode, 
    label: district.DistrictName,
    district: district.DistrictName,
    province: district.ProvinceName
  })) : [];

  useEffect(() => {
    setOpenModal(open);
  }, [open])

  const handleClose = () => {
    setOpenModal(false);
    onClose && onClose();
  };

  return (
    <Box sx={{
        display: openModal ? "flex" : "none",
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
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.paper",
        padding: 2,
        position: "relative",
        gap: 3,
        borderRadius: "16px",
        width: {xs: "90%", sm: "80", lg: "60%", xl: "70%"}
      }}>
        <Box sx={{
          borderBottom: "0.5px solid #E0E0E0",
          paddingBottom: 1,
          width: "100%"
        }}>
          <SelectFacilitiesHeader
            containerProps={{
              width: "100%"
            }}
            handleChangeFacility={(facilityType) => setFacilityType(facilityType)}
            handleClosePopup={() => handleClose()}
          />
        </Box>
          <Grid sx={{margin: 0, padding: 0, width: "100%",}} container spacing={{xs: 0, md: 2}}>
            <Grid item xs={12} md={7}  sx={{padding: 0, marginBottom: {xs: "12px", md: 0}}}>
              <SelectFacilities 
                facilityType = {facilityType}
                allDistricts = {
                  (defaultFacilityType === "district" && defaultFacilities?.length > 0)
                    ? defaultFacilities 
                    : [{value: "all", label: "Todos Distritos"},...formatedDistricts] 
                }
                allClinics={
                  (defaultFacilityType === "clinic" && defaultFacilities?.length > 0)
                    ? defaultFacilities 
                    : [{value: "all", label: "Todas USs"},...formatedClinics]
                }
                onChange={(values: any) => setSelectedFacilities(values)}
                width="100%"
                isMulti={isMulti}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <DateRange 
                onChange={(values) => setDates(values)} 
                initialDates={initialDates}
              />
            </Grid>
          </Grid>
          <SelectFacilitiesFooter 
            containerStyles={{
              width: "100%"
            }}
            handleSubmit={() => {
              handleSubmit(selectedFacilities, facilityType, dates);
              handleClose();
            }}
          />
      </Box>
    </Box>
  );
}
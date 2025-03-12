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
    <Box 
      sx={{
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
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' },
              gap: { xs: 2, md: 2 },
              width: '100%'
            }}
          >
            <Box sx={{ width: '100%', mb: { xs: 1.5, md: 0 } }}>
              <SelectFacilities 
                facilityType={facilityType}
                allDistricts={formatedDistricts}
                allClinics={formatedClinics}
                onChange={(values: any) => setSelectedFacilities(values)}
                width="100%"
                isMulti={isMulti}
              />
            </Box>
            <Box>
              <DateRange 
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
              handleSubmit(selectedFacilities, facilityType, dates);
              handleClose();
            }}
          />
      </Box>
    </Box>
  );
}
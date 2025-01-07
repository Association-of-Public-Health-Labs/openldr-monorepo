import React, {useState} from "react";
import {Box} from "@mui/material";
import {Map as MoleculeMap} from "../../molecules/maps/Map";
import { FiEdit2 } from "react-icons/fi";

import { MapHeader as Header } from "../../molecules/maps/MapHeader";
import { LabsPopup } from "../popups/LabsPopup";

import {FacilitiesProps, RoutesProps} from "../../types/facilities";

export type Options = {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

export type Props = {
  routes: RoutesProps[];
  facilities: FacilitiesProps
  additionalOptions?: Options[];
}

export function Map ({routes, facilities, additionalOptions}: Props) {
  const [openPopup, setOpenPopup] = useState(false);

  const handleOpenPopup = () => {
    setOpenPopup(!openPopup);
  } 

  return (
    <Box sx={{
      width: "100%",
      height: "100%",
      position: "relative"
    }}>
      <Header 
        options={[{
          label: "Editar",
          action: () => handleOpenPopup(),
          icon: <FiEdit2 size={18}/>
        }]}
        additionalOptions={additionalOptions}
      />
      <MoleculeMap routes={routes}/>
      <LabsPopup 
        open={openPopup}
        facilities={facilities}
        labType="conventional"
        handleSubmit={(labs, dates) => {
          console.log(labs, dates)
        }}
        onClose={() => setOpenPopup(false)}
      />
    </Box>
  )
}
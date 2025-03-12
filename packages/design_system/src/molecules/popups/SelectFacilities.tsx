import React, {useState, useEffect} from "react";
import { Box, Typography } from "@mui/material";

import {Select, optionsProps} from "../../atoms/pickers/Select";

export interface DistrictsProps {
  districtCode: string;
  district: string;
  provinceCode: string;
  province: string;
}

export interface ClinicsProps {
  clinicCode: string;
  clinic: string;
  districtCode: string;
  district: string;
  provinceCode: string;
  province: string;
}

export interface Props {
  facilityType: "province" | "district" | "clinic";
  allDistricts: optionsProps[];
  allClinics: optionsProps[];
  width?: number | string;
  onChange?: (facilities: optionsProps[]) => void;
  isMulti?: boolean;
}



const provinces: optionsProps[] = [
  { value: "Maputo Provincia", label: "Maputo Provincia", },
  { value: "Maputo Cidade", label: "Maputo Cidade", },
  { value: "Gaza", label: "Gaza" },
  { value: "Inhambane", label: "Inhambane", },
  { value: "Manica", label: "Manica"},
  { value: "Sofala", label: "Sofala"},
  { value: "Tete", label: "Tete" },
  { value: "Zambezia", label: "Zambézia" },
  { value: "Nampula", label: "Nampula" },
  { value: "Niassa", label: "Niassa" },
  { value: "Cabo Delgado", label: "Cabo Delgado" },
];

export function SelectFacilities({
  facilityType="province", 
  allDistricts, 
  allClinics,
  width="100%",
  onChange, 
  isMulti
}: Props) {
  const [selectedProvinces, setSelectedProvinces] = useState<optionsProps[]>([provinces[0]]);
  const [selectedDistricts, setSelectedDistricts] = useState<optionsProps[]>([allDistricts[0]]);
  const [selectedClinics, setSelectedClinics] = useState<optionsProps[]>([allClinics[0]]);
  const [districts, setDistricts] = useState<optionsProps[] | any[]>([]);
  const [clinics, setClinics] = useState<optionsProps[] | any[]>([]);

  useEffect(() => {
    function loadFacilities() {
      if((facilityType == "district" || facilityType == "clinic") && selectedProvinces?.length > 0) {
        setDistricts(allDistricts.map((district) => {
          if(district?.label !== "" && district?.value !== "" && selectedProvinces.some(province => province.value === district.province || province.value === undefined)){
            return {
              value: district.district, 
              label: district.label,
            }
          }
          return {};
        }).filter(district => JSON.stringify(district) !== "{}"));
      }

      if(facilityType == "clinic" && selectedDistricts?.length > 0) {
        setClinics(allClinics.map((clinic) => {
          if (
            selectedDistricts?.some(district => district.value === clinic.district || district.value === undefined)
          ){
            return {value: clinic.value, label: clinic.label};
          }
          return {};
        })?.filter(clinic => JSON.stringify(clinic) !== "{}"));
        
      }
    }
    loadFacilities();
  },[facilityType,selectedProvinces, selectedDistricts]);


  return (
    <Box sx={{
      width: width,
      display: "flex",
      flexDirection: "column",
      gap: 1,
    }}>
      <Select 
        options={provinces}
        placeholder={"Todas as Provincias"}
        // values={selectedProvinces}
        isMulti={isMulti}
        isDefaultPlaceholderActive={true}
        onChange={(selected: optionsProps[]) => {
          if (Array.isArray(selected)) {
            const allProvincesOption = selected.find(option => option.value === undefined);
            
            if (allProvincesOption) {
              // If "Todas Provincias" is selected, clear other selections
              setSelectedProvinces([allProvincesOption]);
              onChange && onChange([allProvincesOption]);
            } else {
              // Allow multiple selections for other provinces
              setSelectedProvinces(selected);
              onChange && onChange(selected);
            }
          } else {
            // Handle single selection
            setSelectedProvinces([selected]);
            onChange && onChange([selected]);
          }
        }}
      />
      {(facilityType === "district" || facilityType === "clinic") && 
        <Select 
          options={districts} 
          placeholder={"Todos os Distritos"}
          values={selectedDistricts}
          isMulti={isMulti}
          onChange={(selected: optionsProps[]) => {
            if(Array.isArray(selected)){
              if (selected?.find(option => option.value === undefined)){
                setSelectedDistricts([selected[selected.length - 1]]);
                onChange && onChange([selected[selected.length - 1]]);
              }
            }
            else{
              setSelectedDistricts(Array.isArray(selected) ? selected : [selected]);
              onChange && onChange(Array.isArray(selected) ? selected : [selected]);
            }
          }} 
          isDefaultPlaceholderActive={true}
        />
      }
      {(facilityType === "clinic") && 
        <Select 
          options={clinics} 
          placeholder={"Todas as USs"}
          values={selectedClinics}
          isMulti={isMulti}
          onChange={(selected: optionsProps[]) => {
            if(Array.isArray(selected)){
              if (selected?.find(option => option.value === undefined)){
                setSelectedClinics([selected[selected.length - 1]]);
                onChange && onChange([selected[selected.length - 1]]);
              }
            }
            else{
              setSelectedClinics(Array.isArray(selected) ? selected : [selected]);
              onChange && onChange(Array.isArray(selected) ? selected : [selected]);
            }
          }}
          isDefaultPlaceholderActive={true}
        />
      }
    </Box>
  );
}
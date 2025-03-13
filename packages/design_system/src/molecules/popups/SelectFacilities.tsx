import React, {useState, useEffect} from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";

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
  const [selectedProvinces, setSelectedProvinces] = useState<optionsProps[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<optionsProps[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<optionsProps[]>([]);
  const [districts, setDistricts] = useState<optionsProps[] | any[]>([]);
  const [clinics, setClinics] = useState<optionsProps[] | any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (facilityType === "district" || facilityType === "clinic") {
      fetchDistricts();
    }
    if (facilityType === "clinic") {
      fetchClinics();
    }
  }, [facilityType]);

  async function fetchDistricts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://queue.openldr.org.mz/dict/districts');
      const formattedDistricts = response.data.map((district: any) => ({
        value: district.DistrictCode,
        label: district.DistrictName,
        district: district.DistrictName,
        province: district.ProvinceName
      }));
      setDistricts(formattedDistricts);
    } catch (error) {
      setError('Failed to fetch districts');
      console.error('Error fetching districts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchClinics() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://queue.openldr.org.mz/dict/clinics');
      const formattedClinics = response.data.map((clinic: any) => ({
        value: clinic.FacilityCode,
        label: clinic.FacilityName,
        clinic: clinic.FacilityName,
        district: clinic.DistrictName,
        province: clinic.ProvinceName
      }));
      setClinics(formattedClinics);
    } catch (error) {
      setError('Failed to fetch clinics');
      console.error('Error fetching clinics:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter districts based on selected provinces
  useEffect(() => {
    if (selectedProvinces.length > 0) {
      const hasAllProvinces = selectedProvinces.some(p => p.value === undefined);
      if (hasAllProvinces) {
        // If "All Provinces" is selected, show all districts
        fetchDistricts();
      } else {
        // Filter districts based on selected provinces
        const filteredDistricts = districts.filter(district =>
          selectedProvinces.some(province => province.label === district.province)
        );
        setDistricts(filteredDistricts);
      }
      // Reset selected districts when provinces change
      setSelectedDistricts([]);
    }
  }, [selectedProvinces]);

  // Filter clinics based on selected provinces and districts
  useEffect(() => {
    if (facilityType === "clinic") {
      const hasAllProvinces = selectedProvinces.some(p => p.value === undefined);
      const hasAllDistricts = selectedDistricts.some(d => d.value === undefined);

      let filteredClinics = [...clinics];

      if (!hasAllProvinces) {
        // Filter by selected provinces
        filteredClinics = filteredClinics.filter(clinic =>
          selectedProvinces.some(province => province.label === clinic.province)
        );
      }

      if (!hasAllDistricts && selectedDistricts.length > 0) {
        // Further filter by selected districts
        filteredClinics = filteredClinics.filter(clinic =>
          selectedDistricts.some(district => district.label === clinic.district)
        );
      }

      setClinics(filteredClinics);
      // Reset selected clinics when filters change
      setSelectedClinics([]);
    }
  }, [selectedProvinces, selectedDistricts, facilityType]);

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
          isMulti={isMulti}
          value={selectedDistricts}
          isDisabled={selectedProvinces.length === 0}
          onChange={(selected: optionsProps[]) => {
            if(Array.isArray(selected)){
              if (selected?.find(option => option.value === undefined)){
                setSelectedDistricts([selected[selected.length - 1]]);
                onChange && onChange([selected[selected.length - 1]]);
              } else {
                setSelectedDistricts(selected);
                onChange && onChange(selected);
              }
            } else {
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
          placeholder={isLoading ? "Loading clinics..." : "Todas as USs"}
          isDisabled={selectedDistricts.length === 0}
          value={selectedClinics}
          isMulti={isMulti}
          onChange={(selected: optionsProps[]) => {
            if(Array.isArray(selected)){
              if (selected?.find(option => option.value === undefined)){
                setSelectedClinics([selected[selected.length - 1]]);
                onChange && onChange([selected[selected.length - 1]]);
              } else {
                setSelectedClinics(selected);
                onChange && onChange(selected);
              }
            } else {
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
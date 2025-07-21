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
  width?: number | string;
  onChange?: (facilities: optionsProps[]) => void;
  isMulti?: boolean;
  allDistricts?: optionsProps[];
  allClinics?: optionsProps[];
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
  width="100%",
  onChange, 
  isMulti,
  allDistricts = [],
  allClinics = []
}: Props) {
  const [selectedProvinces, setSelectedProvinces] = useState<optionsProps[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<optionsProps[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<optionsProps[]>([]);
  const [fetchedDistricts, setFetchedDistricts] = useState<optionsProps[]>([]);
  const [fetchedClinics, setFetchedClinics] = useState<optionsProps[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<optionsProps[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<optionsProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch districts and clinics on component mount
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
      const response = await axios.get('https://api-ts.openldr.org.mz/dict/districts');
      const formattedDistricts = response.data.map((district: any) => ({
        value: district.DistrictCode,
        label: district.DistrictName,
        district: district.DistrictName,
        province: district.ProvinceName
      }));
      setFetchedDistricts(formattedDistricts);
      setFilteredDistricts(formattedDistricts);
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
      const response = await axios.get('https://api-ts.openldr.org.mz/dict/clinics');
      const formattedClinics = response.data.map((clinic: any) => ({
        value: clinic.FacilityCode,
        label: clinic.FacilityName,
        clinic: clinic.FacilityName,
        district: clinic.DistrictName,
        province: clinic.ProvinceName
      }));
      setFetchedClinics(formattedClinics);
      setFilteredClinics(formattedClinics);
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
      // Filter districts based on selected provinces
      const filtered = fetchedDistricts.filter(district =>
        selectedProvinces.some(province => province.label === district.province)
      );
      setFilteredDistricts(filtered);
    } else {
      // If no provinces selected, show all districts
      setFilteredDistricts(fetchedDistricts);
      // Clear district selection when provinces are cleared
      setSelectedDistricts([]);
    }
  }, [selectedProvinces, fetchedDistricts]);

  // Filter clinics based on selected provinces and districts
  useEffect(() => {
    if (facilityType === "clinic") {
      let filtered = [...fetchedClinics];
      
      // Filter by provinces if any are selected
      if (selectedProvinces.length > 0) {
        filtered = filtered.filter(clinic =>
          selectedProvinces.some(province => province.label === clinic.province)
        );
      }
      
      // Further filter by districts if any are selected
      if (selectedDistricts.length > 0) {
        filtered = filtered.filter(clinic =>
          selectedDistricts.some(district => district.label === clinic.district)
        );
      }
      
      setFilteredClinics(filtered);
      
      // Clear clinic selection when districts are cleared and provinces changed
      if (selectedDistricts.length === 0) {
        setSelectedClinics([]);
      }
    }
  }, [selectedProvinces, selectedDistricts, fetchedClinics, facilityType]);

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
        values={selectedProvinces}
        isDefaultPlaceholderActive={true}
        onChange={(selected: optionsProps[]) => {
          if (Array.isArray(selected)) {
            setSelectedProvinces(selected);
          } else if (selected) {
            setSelectedProvinces([selected]);
          } else {
            setSelectedProvinces([]);
          }
          // Clear district and clinic selections when province changes or is cleared
          setSelectedDistricts([]);
          setSelectedClinics([]);
          onChange && onChange(Array.isArray(selected) ? selected : selected ? [selected] : []);
        }}
      />
      {(facilityType === "district" || facilityType === "clinic") && 
        <Select 
          options={filteredDistricts} 
          placeholder={isLoading ? "A carregar..." : "Todos Distritos"}
          isMulti={isMulti}
          values={selectedDistricts}
          isDisabled={isLoading}
          onChange={(selected: optionsProps[]) => {
            if (Array.isArray(selected)) {
              setSelectedDistricts(selected);
            } else if (selected) {
              setSelectedDistricts([selected]);
            } else {
              setSelectedDistricts([]);
            }
            // Clear clinic selections when district changes or is cleared
            setSelectedClinics([]);
            onChange && onChange(Array.isArray(selected) ? selected : selected ? [selected] : []);
          }} 
          isDefaultPlaceholderActive={true}
        />
      }
      {(facilityType === "clinic") && 
        <Select 
          options={filteredClinics} 
          placeholder={isLoading ? "A carregar..." : "Todas USs"}
          isMulti={isMulti}
          values={selectedClinics}
          isDisabled={isLoading}
          onChange={(selected: optionsProps[]) => {
            if (Array.isArray(selected)) {
              setSelectedClinics(selected);
            } else if (selected) {
              setSelectedClinics([selected]);
            } else {
              setSelectedClinics([]);
            }
            onChange && onChange(Array.isArray(selected) ? selected : selected ? [selected] : []);
          }}
          isDefaultPlaceholderActive={true}
        />
      }
    </Box>
  );
}
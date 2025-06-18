"use client";
import React, { useState } from 'react';
import ToggleButton, { toggleButtonClasses } from '@mui/material/ToggleButton';
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';
import { styled } from "@mui/material/styles";
import { Box, Card, Typography, Button as MuiButton } from "@mui/material";
import { Button } from "../../atoms";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: "4px",
  borderRadius: "16px",
  fontWeight: "bold",
  [`& .${toggleButtonGroupClasses.firstButton}, & .${toggleButtonGroupClasses.middleButton}`]:
    {
      borderRadius: "16px",
      fontWeight: "bold",
      border: "none",
    },
  [`& .${toggleButtonGroupClasses.lastButton}, & .${toggleButtonGroupClasses.middleButton}`]:
    {
      borderRadius: "16px",
      fontWeight: "bold",
      border: "none",
    },
  [`& .${toggleButtonGroupClasses.lastButton}.${toggleButtonClasses.disabled}, & .${toggleButtonGroupClasses.middleButton}.${toggleButtonClasses.disabled}`]:
    {
      borderRadius: "16px",
      fontWeight: "bold",
      border: "none",
    },
}));

const provinces = [
  "Cabo Delgado",
  "Gaza",
  "Inhambane", 
  "Manica",
  "Maputo Provincia",
  "Maputo Cidade",
  "Nampula",
  "Niassa",
  "Sofala",
  "Tete",
  "Zambezia"
];

interface District {
  DistrictCode: string;
  DistrictName: string;
  ProvinceCode: string;
  ProvinceName: string;
}

interface Clinic {
  FacilityCode: string;
  FacilityName: string;
  DistrictCode: string;
  DistrictName: string;
}

type Step = "facilityType" | "provinces" | "districts" | "clinics";

export function FacilitySelector({ 
  onSelectionComplete 
}: { 
  onSelectionComplete?: (selection: { 
    facilityType: string,
    provinces: string[], 
    districts: string[], 
    clinics: string[] 
  }) => void 
}) {
  const [currentStep, setCurrentStep] = useState<Step>('facilityType');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('');
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedClinics, setSelectedClinics] = useState<string[]>([]);
  const [isProcessComplete, setIsProcessComplete] = useState(false);
  
  const [districts, setDistricts] = useState<District[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://queue.openldr.org.mz/dict/districts");
      const data = await response.json();
      const filteredDistricts = data
        .filter((district: District) => 
          selectedProvinces.includes(district.ProvinceName) && 
          district.DistrictName?.trim()
        );
      setDistricts(filteredDistricts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
    setIsLoading(false);
  };

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://queue.openldr.org.mz/dict/clinics");
      const data = await response.json();
      const filteredClinics = data
        .filter((clinic: Clinic) => 
          selectedDistricts.includes(clinic.DistrictName) && 
          clinic.FacilityName?.trim() && 
          clinic.FacilityCode?.trim()
        );
      setClinics(filteredClinics);
    } catch (error) {
      console.error("Error fetching clinics:", error);
    }
    setIsLoading(false);
  };

  const getFinalStep = (facilityType: string) => {
    switch (facilityType) {
      case "Provincia": return "provinces";
      case "Distrito": return "districts";
      case "Unidade Sanitaria": return "clinics";
      default: return "provinces";
    }
  };

  const handleNext = async () => {
    if (currentStep === "facilityType" && selectedFacilityType) {
      setCurrentStep("provinces");
    } 
    else if (currentStep === "provinces" && selectedProvinces.length > 0) {
      if (selectedFacilityType === "Provincia") {
        onSelectionComplete?.({
          facilityType: selectedFacilityType,
          provinces: selectedProvinces,
          districts: [],
          clinics: []
        });
      } else {
        await fetchDistricts();
        setCurrentStep("districts");
      }
    } 
    else if (currentStep === "districts" && selectedDistricts.length > 0) {
      if (selectedFacilityType === "Distrito") {
        onSelectionComplete?.({
          facilityType: selectedFacilityType,
          provinces: selectedProvinces,
          districts: selectedDistricts,
          clinics: []
        });
      } else {
        await fetchClinics();
        setCurrentStep("clinics");
      }
    } 
    else if (currentStep === "clinics" && selectedClinics.length > 0) {
      setIsProcessComplete(true);
      onSelectionComplete?.({
        facilityType: selectedFacilityType,
        provinces: selectedProvinces,
        districts: selectedDistricts,
        clinics: selectedClinics
      });
    }
  };

  const handleBack = () => {
    if (currentStep === "provinces") {
      setCurrentStep("facilityType");
    } else if (currentStep === "districts") {
      setCurrentStep("provinces");
      setSelectedDistricts([]);
      setDistricts([]);
    } else if (currentStep === "clinics") {
      setCurrentStep("districts");
      setSelectedClinics([]);
      setClinics([]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "facilityType":
        return (
          <>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            > 
              Selecione a categoria que deseja consultar.
            </Typography>
            <StyledToggleButtonGroup
              value={selectedFacilityType}
              exclusive
              onChange={(event, value) => setSelectedFacilityType(value)}
              aria-label="text alignment"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                width: "100%",
                overflow: "hidden",
              }}
            >
              {["Provincia", "Distrito", "Unidade Sanitaria"].map((type) => (
                <ToggleButton 
                  key={type}
                  value={type} 
                  aria-label="left aligned"
                  sx={{
                    fontWeight: "400",
                    "&.Mui-selected": {
                      fontWeight: "bold",
                    }
                  }}
                >
                  {type}
                </ToggleButton>
              ))}
            </StyledToggleButtonGroup>
          </>
        );

      case "provinces":
        return (
          <>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            > 
              Selecione pelo menos uma Província.
            </Typography>
            <StyledToggleButtonGroup
              value={selectedProvinces}
              onChange={(event, value) => setSelectedProvinces(value)}
              exclusive={false}
              aria-label="text alignment"
              sx={{
                display: "flex",
                flexWrap: "wrap",
                width: "100%",
                overflow: "hidden",
              }}
            >
              {provinces
                .filter(province => province?.trim())
                .map((province, index) => (
                  <ToggleButton 
                    key={index}
                    value={province}
                    aria-label="left aligned"
                  >
                    {province}
                  </ToggleButton>
                ))}
            </StyledToggleButtonGroup>
          </>
        );

      case "districts":
        return (
          <>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            > 
              Selecione pelo menos um distrito das províncias selecionadas.
            </Typography>
            {isLoading ? (
              <div className="flex justify-center">
                {/* <Loader2 className="h-6 w-6 animate-spin" /> */}
                Loading...
              </div>
            ) : (
              <Box>
                <StyledToggleButtonGroup
                  value={selectedDistricts}
                  onChange={(event, value) => setSelectedDistricts(value)}
                  aria-label="text alignment"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                    {districts
                    .filter(district => district.DistrictName?.trim())
                    .map((district, index) => (
                      <ToggleButton 
                        key={index}
                        value={district.DistrictName}
                        aria-label="left aligned"
                      >
                        {district.DistrictName}
                      </ToggleButton>
                    ))}
                </StyledToggleButtonGroup>
              </Box>
            )}
          </>
        );

      case "clinics":
        return (
          <>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
              }}
            > 
              Selecione as Unidades Sanitárias
            </Typography>
            <Typography 
              variant="subtitle2"
            > 
              Selecione pelo menos uma unidade sanitária dos distritos selecionados.
            </Typography>
            {isLoading ? (
              <div className="flex justify-center">
                {/* <Loader2 className="h-6 w-6 animate-spin" /> */}
                Loading...
              </div>
            ) : (
              <StyledToggleButtonGroup
                value={selectedClinics}
                onChange={(event, value) => setSelectedClinics(value)}
                aria-label="text alignment"
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                  {clinics
                  .filter(clinic => clinic.FacilityName?.trim() && clinic.FacilityCode?.trim())
                  .map((clinic, index) => (
                    <ToggleButton 
                      key={index}
                      value={clinic.FacilityCode}
                      aria-label="left aligned"
                    >
                      {clinic.FacilityName}
                    </ToggleButton>
                  ))}
              </StyledToggleButtonGroup>
            )}
          </>
        );
    }
  };

  return (
    <Card 
      sx={{ 
        padding: "16px",
        borderRadius: "16px",
        boxShadow: "none",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {isProcessComplete ? (
        <Box>
          <Typography 
            variant="subtitle1"
            sx={{
              fontWeight: "bold",
            }}
          > 
            Unidades Sanitárias
          </Typography>
          <Box>
            {selectedClinics.map((clinic) => (
              <Typography key={clinic}>{clinic}</Typography>
            ))}
          </Box>
        </Box>
      ) : (
        <>
          <Box>
            {renderStepContent()}
          </Box>
          <Box sx={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-start",
          }}>
            {currentStep !== "facilityType" && (
              <MuiButton 
                variant="outlined"
                color="inherit"
                onClick={handleBack}
                disabled={isLoading}
                sx={{
                  borderRadius: "16px",
                  fontWeight: "bold",
                  padding: "8px 16px",
                }}
              >
                Voltar
              </MuiButton>
            )}
          
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleNext}
              sx={{
                borderRadius: "16px",
                fontWeight: "bold",
                padding: "8px 16px",
              }}
              disabled={
                isLoading ||
                (currentStep === "facilityType" && !selectedFacilityType) ||
                (currentStep === "provinces" && selectedProvinces.length === 0) ||
                (currentStep === "districts" && selectedDistricts.length === 0) ||
                (currentStep === "clinics" && selectedClinics.length === 0)
              }
            >
              {isLoading ? (
                <>
                  {/* <Loader2 className="mr-2 h-4 w-4 animate-spin" /> */}
                  Carregando...
                </>
              ) : (
                ((currentStep === 'provinces' && selectedFacilityType === 'Provincia') ||
                (currentStep === 'districts' && selectedFacilityType === 'Distrito') ||
                (currentStep === 'clinics' && selectedFacilityType === 'Unidade Sanitaria')) 
                  ? 'Concluir' 
                  : 'Próximo'
              )}
            </Button>
          </Box>
        </>
      )}
      
    </Card>
  );
}


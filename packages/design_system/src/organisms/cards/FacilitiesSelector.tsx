"use client";
import { useState } from "react";
import ToggleButton, { toggleButtonClasses } from "@mui/material/ToggleButton";
import 
  ToggleButtonGroup, { toggleButtonGroupClasses, } 
from "@mui/material/ToggleButtonGroup";
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

type FacilityType = "province" | "district" | "clinic";

export function FacilitySelector({ 
  onSelectionComplete 
}: { 
  onSelectionComplete?: (selection: { 
    facilityType: FacilityType,
    provinces: string[], 
    districts: string[], 
    clinics: string[] 
  }) => void 
}) {
  const [currentStep, setCurrentStep] = useState<Step>("facilityType");
  const [selectedFacilityType, setSelectedFacilityType] = useState<FacilityType>(null);
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
      const response = await fetch("https://api-ts.openldr.org.mz/dict/districts");
      const data = await response.json();
      const filteredDistricts = data
        .filter((district: District) => 
          selectedProvinces.includes(district.ProvinceName) && 
          district.DistrictName?.trim()
        );
      setDistricts(filteredDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
    setIsLoading(false);
  };

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://api-ts.openldr.org.mz/dict/clinics");
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
      if (selectedFacilityType === "province") {
        setIsProcessComplete(true);
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
      if (selectedFacilityType === "district") {
        setIsProcessComplete(true);
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
              }}
            > 
              Selecione a categoria que deseja consultar
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
              {[
                {
                  name: "Província", 
                  value: "province"
                }, 
                {
                  name: "Distrito", 
                  value: "district"
                }, 
                {
                  name: "Unidade Sanitária", 
                  value: "clinic"
                }
              ]?.map((type) => (
                <ToggleButton 
                  key={type.value}
                  value={type.value} 
                  aria-label="left aligned"
                  sx={{
                    fontWeight: "400",
                    "&.Mui-selected": {
                      fontWeight: "bold",
                    }
                  }}
                >
                  {type.name}
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
              }}
            > 
              Selecione pelo menos uma Província
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
              }}
            > 
              Selecione pelo menos um distrito das províncias selecionadas
            </Typography>
            {isLoading ? (
              <div className="flex justify-center">
                Carregando...
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
              Selecione pelo menos uma Unidade Sanitária dos distritos selecionados
            </Typography>
            {isLoading ? (
              <div className="flex justify-center">
                Carregando...
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
  
  if(isProcessComplete) {
    return null
  }

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
      {/* {isProcessComplete ? (
        <>
          <Box>
            <Typography 
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
              }}
            > 
              {selectedFacilityType === "province" ? "Províncias" : selectedFacilityType === "district" ? "Distritos" : "Unidades Sanitárias"}:
            </Typography>
            <Box>
              {
                selectedClinics?.length > 0 && (
                  <Box>
                    <Typography>{selectedClinics?.join(", ")}</Typography>
                  </Box>
                )
              }
              {selectedClinics?.length === 0 && (
                <Box>
                  <Typography>{selectedDistricts?.join(", ")}</Typography>
                </Box>
              )}
              {selectedClinics?.length === 0 && (
                <Box>
                  <Typography>{selectedProvinces?.join(", ")}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </>
      ) : ( */}
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
                  Carregando...
                </>
              ) : (
                (
                  (currentStep === "provinces" && selectedFacilityType === "province") ||
                  (currentStep === "districts" && selectedFacilityType === "district") ||
                  (currentStep === "clinics" && selectedFacilityType === "clinic")
                ) 
                  ? "Concluir" 
                  : "Próximo"
              )}
            </Button>
          </Box>
        </>
      {/* )} */}
    </Card>
  );
}


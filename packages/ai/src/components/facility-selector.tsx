"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";

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
      case 'Provincia': return 'provinces';
      case 'Distrito': return 'districts';
      case 'Unidade Sanitaria': return 'clinics';
      default: return 'provinces';
    }
  };

  const handleNext = async () => {
    if (currentStep === 'facilityType' && selectedFacilityType) {
      setCurrentStep('provinces');
    } 
    else if (currentStep === "provinces" && selectedProvinces.length > 0) {
      if (selectedFacilityType === 'Provincia') {
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
      if (selectedFacilityType === 'Distrito') {
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
      onSelectionComplete?.({
        facilityType: selectedFacilityType,
        provinces: selectedProvinces,
        districts: selectedDistricts,
        clinics: selectedClinics
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'provinces') {
      setCurrentStep('facilityType');
    } else if (currentStep === 'districts') {
      setCurrentStep('provinces');
      setSelectedDistricts([]);
      setDistricts([]);
    } else if (currentStep === 'clinics') {
      setCurrentStep('districts');
      setSelectedClinics([]);
      setClinics([]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'facilityType':
        return (
          <>
            <CardTitle>Como Deseja Consultar?</CardTitle>
            <CardDescription>Selecione a categoria que deseja consultar.</CardDescription>
            <ToggleGroup 
              type="single"
              value={selectedFacilityType}
              onValueChange={setSelectedFacilityType}
              className="flex flex-wrap items-start justify-start gap-2 w-full"
            >
              {['Provincia', 'Distrito', 'Unidade Sanitaria'].map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                >
                  {type}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </>
        );

      case 'provinces':
        return (
          <>
            <CardTitle>Selecione as Províncias</CardTitle>
            <CardDescription>Selecione pelo menos uma província.</CardDescription>
            <ToggleGroup 
              type="multiple"
              value={selectedProvinces}
              onValueChange={setSelectedProvinces}
              className="flex flex-wrap items-start justify-start gap-2 w-full"
            >
              {provinces
                .filter(province => province?.trim())
                .map((province, index) => (
                  <ToggleGroupItem
                    key={index}
                    value={province}
                    className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                  >
                    {province}
                  </ToggleGroupItem>
                ))}
            </ToggleGroup>
          </>
        );

      case 'districts':
        return (
          <>
            <CardTitle>Selecione os Distritos</CardTitle>
            <CardDescription>Selecione pelo menos um distrito das províncias selecionadas.</CardDescription>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ToggleGroup 
                type="multiple"
                value={selectedDistricts}
                onValueChange={setSelectedDistricts}
                className="flex flex-wrap items-start justify-start gap-2 w-full"
              >
                {districts
                  .filter(district => district.DistrictName?.trim())
                  .map((district, index) => (
                    <ToggleGroupItem
                      key={index}
                      value={district.DistrictName}
                      className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                    >
                      {district.DistrictName}
                    </ToggleGroupItem>
                  ))}
              </ToggleGroup>
            )}
          </>
        );

      case 'clinics':
        return (
          <>
            <CardTitle>Selecione as Unidades Sanitárias</CardTitle>
            <CardDescription>Selecione pelo menos uma unidade sanitária dos distritos selecionados.</CardDescription>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ToggleGroup 
                type="multiple"
                value={selectedClinics}
                onValueChange={setSelectedClinics}
                className="flex flex-wrap items-start justify-start gap-2 w-full"
              >
                {clinics
                  .filter(clinic => clinic.FacilityName?.trim() && clinic.FacilityCode?.trim())
                  .map((clinic, index) => (
                    <ToggleGroupItem
                      key={index}
                      value={clinic.FacilityCode}
                      className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                    >
                      {clinic.FacilityName}
                    </ToggleGroupItem>
                  ))}
              </ToggleGroup>
            )}
          </>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        {renderStepContent()}
      </CardHeader>
      <CardFooter className="flex justify-end gap-2 border-t">
        {currentStep !== "facilityType" && (
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isLoading}
          > 
            Voltar
          </Button>
        )}
        <Button 
          onClick={handleNext}
          disabled={
            isLoading ||
            (currentStep === 'facilityType' && !selectedFacilityType) ||
            (currentStep === 'provinces' && selectedProvinces.length === 0) ||
            (currentStep === 'districts' && selectedDistricts.length === 0) ||
            (currentStep === 'clinics' && selectedClinics.length === 0)
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      </CardFooter>
    </Card>
  );
}

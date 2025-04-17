"use client";

import { useState } from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Lab {
  DateTimeStamp: string;
  VersionStamp: string;
  LIMSVendorCode: string;  
  LabCode: string; 
  FacilityCode: string;
  LabName: string; 
  LabType: string;
  StaffingLevel: string;
}

type Step = "labType" | "labs";
type LabType = "all" | "conventional" | "poc";

const LAB_TYPES = [
  { value: "all", label: "Todos" },
  { value: "conventional", label: "Convencional" },
  { value: "poc", label: "Point of care" }
];

export function LabSelector({ 
  onSelectionComplete 
}: { 
  onSelectionComplete?: (selection: { 
    labTypes: LabType[],
    labs: string[] // Will contain LabCodes
  }) => void 
}) {
  const [currentStep, setCurrentStep] = useState<Step>("labType");
  const [selectedLabTypes, setSelectedLabTypes] = useState<LabType[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleLabTypeChange = (types: LabType[]) => {
    const wasAllSelected = selectedLabTypes.includes("all");
    const isAllSelected = types.includes("all");

    if (!wasAllSelected && isAllSelected) {
      // If "all" was just selected, select everything
      setSelectedLabTypes(["all", "conventional", "poc"]);
    } else if (wasAllSelected && !isAllSelected) {
      // If "all" was just unselected, unselect everything
      setSelectedLabTypes([]);
    } else {
      // Normal selection behavior without "all"
      setSelectedLabTypes(types.filter(type => type !== "all"));
    }
  };

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const requests = selectedLabTypes
        .filter(type => type !== "all")
        .map(type => {
          const url = type === "conventional" 
            ? "https://queue.openldr.org.mz/dict/labs"
            : "https://queue.openldr.org.mz/dict/pocs";
          return fetch(url).then(res => res.json());
        });

      const results = await Promise.all(requests);
      const allLabs = results.flat().filter((lab: Lab) => 
        lab.LabName?.trim() && lab.LabCode?.trim()
      );
      
      setLabs(allLabs);
    } catch (error) {
      console.error("Error fetching labs:", error);
    }
    setIsLoading(false);
  };

  const handleNext = async () => {
    if (currentStep === "labType" && selectedLabTypes.length > 0) {
      await fetchLabs();
      setCurrentStep("labs");
    } else if (currentStep === "labs" && selectedLabs.length > 0) {
      onSelectionComplete?.({
        labTypes: selectedLabTypes,
        labs: selectedLabs
      });
    }
  };

  const handleBack = () => {
    setCurrentStep("labType");
    setSelectedLabs([]);
    setLabs([]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "labType":
        return (
          <>
            <CardTitle>Tipo de Laboratório</CardTitle>
            <CardDescription>Selecione o tipo de laboratório que deseja consultar.</CardDescription>
            <ToggleGroup 
              type="multiple"
              value={selectedLabTypes}
              onValueChange={handleLabTypeChange}
              className="flex flex-wrap items-start justify-start gap-2 w-full"
            >
              {LAB_TYPES.map(({ value, label }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                >
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </>
        );

      case "labs":
        return (
          <>
            <CardTitle>Selecione os Laboratórios</CardTitle>
            <CardDescription>Selecione pelo menos um laboratório.</CardDescription>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ToggleGroup 
                type="multiple"
                value={selectedLabs}
                onValueChange={setSelectedLabs}
                className="flex flex-wrap items-start justify-start gap-2 w-full"
              >
                {labs.map((lab) => (
                  <ToggleGroupItem
                    key={lab.LabCode}
                    value={lab.LabCode}
                    className="flex-none border border-muted-foreground/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary hover:bg-muted/60 transition-colors rounded-xl"
                  >
                    {lab.LabName}
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
        {currentStep !== "labType" && (
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
            (currentStep === "labType" && selectedLabTypes.length === 0) ||
            (currentStep === "labs" && selectedLabs.length === 0)
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            currentStep === "labs" ? "Concluir" : "Próximo"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

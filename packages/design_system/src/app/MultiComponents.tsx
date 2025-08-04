import { PatientsAdvancedDataTable } from "@/components/patients-advanced-data-table";
import { Button as MuiButton } from "@mui/material";
import { Button as ShadcnButton } from "@repo/utilities";
// import { MainCard } from "./organisms/cards/MainCard2"

export const MultiComponents = () => {

  return (
    <div>
      <MuiButton 
        variant="contained" 
        color="primary" 
        size="large"
        sx={{
          backgroundColor: "red",
          color: "white",
          "&:hover": {
            backgroundColor: "blue",
          },
        }}
      >
        MUI Button
      </MuiButton>
      <ShadcnButton>Shadcn Button</ShadcnButton>
      <PatientsAdvancedDataTable data={[]} rowsPerPage={10} />
    </div>
  )
}
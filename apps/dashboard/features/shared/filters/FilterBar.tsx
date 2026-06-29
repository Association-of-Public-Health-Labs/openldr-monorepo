import { Box, Paper, Typography } from "@mui/material";
import { DateRangeFilter } from "./DateRangeFilter";
import { DistrictFilter } from "./DistrictFilter";
import { FacilityFilter } from "./FacilityFilter";
import { LaboratoryFilter } from "./LaboratoryFilter";
import { ProvinceFilter } from "./ProvinceFilter";

export function FilterBar() {
  // Reservado para utilitários futuros. Não deve ser usado no layout principal:
  // os filtros da dashboard unificada pertencem ao contexto de cada MainCard.
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        mb: 3,
      }}
    >
      <Typography color="text.primary" fontSize={13} fontWeight={900} mb={1.5}>
        Filtros reservados para cards
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <DateRangeFilter />
        <ProvinceFilter />
        <DistrictFilter />
        <LaboratoryFilter />
        <FacilityFilter />
      </Box>
    </Paper>
  );
}

"use client";

import { Box, Typography } from "@mui/material";
import { Search } from "lucide-react";

type ViralLoadPatientEmptyStateProps = {
  hasSearched: boolean;
};

export function ViralLoadPatientEmptyState({ hasSearched }: ViralLoadPatientEmptyStateProps) {
  return (
    <Box
      sx={{
        alignItems: "center",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: 220,
        px: 3,
        py: 5,
        textAlign: "center",
      }}
    >
      <Box sx={{ color: "text.secondary", display: "flex" }}>
        <Search size={28} />
      </Box>
      <Typography fontSize={16} fontWeight={900}>
        {hasSearched ? "Nenhum resultado encontrado" : "Nenhuma pesquisa realizada"}
      </Typography>
      <Typography color="text.secondary" fontSize={13.5} fontWeight={700} sx={{ maxWidth: 520 }}>
        {hasSearched
          ? "A pesquisa não encontrou pacientes para os filtros informados."
          : "Selecione um método de pesquisa e preencha os filtros para pesquisar pacientes."}
      </Typography>
    </Box>
  );
}

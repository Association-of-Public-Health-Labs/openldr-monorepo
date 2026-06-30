"use client";

import { Chip, Stack } from "@mui/material";

const futureActions = ["Documentação", "Dúvidas", "Exportação"];

export function ReportCardActions() {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.75}>
      {futureActions.map((action) => (
        <Chip key={action} label={`${action}: em breve`} size="small" variant="outlined" />
      ))}
    </Stack>
  );
}


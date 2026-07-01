"use client";

import { Alert } from "@mui/material";

export function ViralLoadPatientErrorState({ message }: { message: string }) {
  return (
    <Alert severity="warning" sx={{ borderRadius: 1.5, mb: 2 }}>
      {message}
    </Alert>
  );
}

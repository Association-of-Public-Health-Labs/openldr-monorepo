"use client";

import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { PatientDrillDownRow } from "./types";

type GeoDrillDownPatientsTableProps = {
  rows: PatientDrillDownRow[];
};

export function GeoDrillDownPatientsTable({ rows }: GeoDrillDownPatientsTableProps) {
  if (!rows.length) {
    return (
      <Box sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: 160, textAlign: "center" }}>
        <Typography color="text.secondary" fontSize={13} fontWeight={800}>
          Nenhum paciente encontrado para o contexto selecionado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.25, maxHeight: 360, overflow: "auto" }}>
      <Table size="small" stickyHeader sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Identificador/NID</TableCell>
            <TableCell>Unidade Sanitária</TableCell>
            <TableCell>Província</TableCell>
            <TableCell>Distrito</TableCell>
            <TableCell>Data da amostra</TableCell>
            <TableCell>Data do resultado</TableCell>
            <TableCell>Resultado</TableCell>
            <TableCell>Carga viral</TableCell>
            <TableCell>Motivo de teste</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow hover key={row.id}>
              <TableCell>{row.patientName}</TableCell>
              <TableCell>{row.identifier || "—"}</TableCell>
              <TableCell>{row.facility || "—"}</TableCell>
              <TableCell>{row.province || "—"}</TableCell>
              <TableCell>{row.district || "—"}</TableCell>
              <TableCell>{row.sampleDate || "—"}</TableCell>
              <TableCell>{row.resultDate || "—"}</TableCell>
              <TableCell>{row.result || "—"}</TableCell>
              <TableCell>{row.viralLoad || "—"}</TableCell>
              <TableCell>{row.testReason || "—"}</TableCell>
              <TableCell>{row.status || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}


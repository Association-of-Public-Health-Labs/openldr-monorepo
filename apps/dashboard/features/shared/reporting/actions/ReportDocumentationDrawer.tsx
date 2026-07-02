"use client";

import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { Button } from "@repo/design_system/app/atoms/inputs/Button";
import { reportActionIcons } from "./reportActionIcons";
import type { ReportDocumentation } from "./types";

type ReportDocumentationDrawerProps = {
  documentation?: ReportDocumentation;
  onClose: () => void;
  open: boolean;
};

export function ReportDocumentationDrawer({ documentation, onClose, open }: ReportDocumentationDrawerProps) {
  const sections = [
    { label: "Descrição", value: documentation?.description },
    { label: "Interpretação", value: documentation?.interpretation },
    { label: "Fonte de dados", value: documentation?.dataSource },
    { label: "Endpoint", value: documentation?.endpoint },
    { label: "Notas de cálculo", value: documentation?.calculationNotes },
    { label: "Limitações", value: documentation?.limitations },
  ].filter((section) => section.value);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ maxWidth: "100vw", p: { sm: 3, xs: 2 }, width: { sm: 460, xs: "100vw" } }}>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography color="text.secondary" fontSize={12} fontWeight={800} textTransform="uppercase">
              Documentação do relatório
            </Typography>
            <Typography component="h2" fontSize={22} fontWeight={900} lineHeight={1.15} sx={{ mt: 0.7 }}>
              {documentation?.title || "Relatório"}
            </Typography>
          </Box>
          <IconButton aria-label="Fechar documentação" onClick={onClose} size="small">
            {reportActionIcons.close}
          </IconButton>
        </Stack>

        <Stack spacing={2.2} sx={{ mt: 3 }}>
          {sections.length ? (
            sections.map((section) => (
              <Box key={section.label}>
                <Typography color="text.secondary" fontSize={12} fontWeight={850} textTransform="uppercase">
                  {section.label}
                </Typography>
                <Typography color="text.primary" fontSize={14} lineHeight={1.65} sx={{ mt: 0.45 }}>
                  {section.value}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" fontSize={14}>
              A documentação deste cartão será completada numa fase posterior.
            </Typography>
          )}
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button onClick={onClose} startIcon={reportActionIcons.close} variant="outlined">
            Fechar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

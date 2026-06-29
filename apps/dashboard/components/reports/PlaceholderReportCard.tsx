"use client";

import dynamic from "next/dynamic";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { FileText } from "lucide-react";
import type { MainCardProps } from "@repo/design_system_mui/organisms/cards/MainCard";

type PlaceholderReportCardProps = {
  description: string;
  subtitle: string;
  tags?: string[];
  title: string;
};

const MainCard = dynamic<MainCardProps>(
  () => import("@repo/design_system_mui/organisms/cards/MainCard").then((module) => module.MainCard),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "16px",
          minHeight: 320,
        }}
      />
    ),
  },
);

const placeholderUser = {
  name: "Utilizador OpenLDR",
  email: "utilizador@openldr.org.mz",
};

export function PlaceholderReportCard({ description, subtitle, tags = [], title }: PlaceholderReportCardProps) {
  const content = (
    <Box
      sx={{
        minHeight: 250,
        height: "100%",
        display: "grid",
        alignContent: "center",
        justifyItems: "center",
        gap: 2,
        px: 3,
        py: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <FileText size={24} />
      </Box>
      <Stack spacing={0.75} alignItems="center">
        <Typography color="text.primary" fontSize={15} fontWeight={800} lineHeight={1.4}>
          Relatório em planeamento
        </Typography>
        <Typography color="text.secondary" fontSize={13} lineHeight={1.65} maxWidth={430}>
          {description} Este cartão será ligado ao endpoint analítico correspondente na próxima fase.
        </Typography>
      </Stack>
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "center" }}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Box>
    </Box>
  );

  return (
    <MainCard
      height="100%"
      subtitle={subtitle}
      title={title}
      user={placeholderUser}
      bodyProps={{ sx: { display: "flex", flexDirection: "column" } }}
    >
      {content}
    </MainCard>
  );
}

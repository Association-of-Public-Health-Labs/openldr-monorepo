import Link from "next/link";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ModuleLandingCardProps = {
  areas: string[];
  description: string;
  href: string;
  icon: ReactNode;
  name: string;
};

export function ModuleLandingCard({ areas, description, href, icon, name }: ModuleLandingCardProps) {
  return (
    <Paper
      component={Link}
      elevation={0}
      href={href}
      sx={{
        height: "100%",
        minHeight: 260,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        bgcolor: "background.paper",
        boxShadow: 0.5,
        color: "inherit",
        textDecoration: "none",
        transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
          transform: "translateY(-1px)",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(0,176,0,0.1)",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.primary" fontSize={18} fontWeight={900} noWrap>
            {name}
          </Typography>
          <Typography color="text.secondary" fontSize={12.5} fontWeight={700} noWrap>
            Módulo da dashboard
          </Typography>
        </Box>
      </Stack>

      <Typography color="text.secondary" fontSize={13.5} lineHeight={1.7}>
        {description}
      </Typography>

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
        {areas.map((area) => (
          <Chip key={area} label={area} size="small" variant="outlined" />
        ))}
      </Box>

      <Box sx={{ mt: "auto", display: "flex", justifyContent: "flex-end" }}>
        <Typography
          color="primary.main"
          fontSize={13}
          fontWeight={900}
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
        >
          Abrir módulo
          <ArrowRight size={15} />
        </Typography>
      </Box>
    </Paper>
  );
}

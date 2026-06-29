import { Box, Typography } from "@mui/material";
import { PageHeader } from "@/components/layout/PageHeader";
import { ModuleLandingCard } from "@/components/reports/ModuleLandingCard";
import { getActivePage, moduleLandingItems } from "@/config/navigation";

export default function SummaryPage() {
  const page = getActivePage("/summary");

  return (
    <>
      <PageHeader context="Migração incremental" subtitle={page.subtitle} title={page.title} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 2, md: 3 },
          alignItems: "stretch",
        }}
      >
        {moduleLandingItems.map((item) => (
          <ModuleLandingCard
            areas={item.areas}
            description={item.description}
            href={item.href}
            icon={item.icon}
            key={item.name}
            name={item.name}
          />
        ))}
      </Box>
      <Box sx={{ mt: 3 }}>
        <Typography color="text.secondary" fontSize={13.5}>
          A área está preparada para migração incremental dos relatórios reais, sem ligação à API nesta fase.
        </Typography>
      </Box>
    </>
  );
}

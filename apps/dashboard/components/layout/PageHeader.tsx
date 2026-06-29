import { Box, Chip, Typography } from "@mui/material";

type PageHeaderProps = {
  context?: string;
  subtitle: string;
  title: string;
};

export function PageHeader({ context = "Migração incremental", subtitle, title }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "flex-end" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.primary" fontSize={{ xs: 24, md: 30 }} fontWeight={900} lineHeight={1.2}>
          {title}
        </Typography>
        <Typography color="text.secondary" fontSize={14} lineHeight={1.7} maxWidth={780} mt={0.75}>
          {subtitle}
        </Typography>
      </Box>
      <Chip color="primary" label={context} size="small" variant="outlined" />
    </Box>
  );
}


import { Box, Skeleton, Typography, Stack } from "@mui/material";

export function StatusCardSkeleton({ sx }: { sx?: any }) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        borderRadius: 3,
        p: 3,
        minWidth: 320,
        minHeight: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...sx,
      }}
    >
      {/* Title */}
      <Skeleton variant="text" width={140} height={28} sx={{ mb: 2 }} />

      {/* Main values row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Skeleton variant="text" width={40} height={24} />
          <Skeleton variant="text" width={60} height={28} />
        </Box>
        <Box>
          <Skeleton variant="text" width={40} height={24} />
          <Skeleton variant="text" width={60} height={28} />
        </Box>
      </Box>

      {/* Subtitle */}
      <Skeleton variant="text" width={100} height={18} sx={{ mb: 1 }} />

      {/* Mini chart line */}
      <Skeleton variant="rectangular" width="100%" height={18} sx={{ borderRadius: 1 }} />
    </Box>
  );
}
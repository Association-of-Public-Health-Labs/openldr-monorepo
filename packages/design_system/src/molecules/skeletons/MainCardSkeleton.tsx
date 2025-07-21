
import { Box, Skeleton } from "@mui/material";

export function MainCardSkeleton({ sx }: { sx?: any }) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        boxShadow: 1,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
        overflow: "hidden",
        p: 3,
        minHeight: 420,
        ...sx,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Skeleton variant="text" width={120} height={18} sx={{ mr: 2 }} /> {/* Subtitle */}
        <Box sx={{ flex: 1 }} />
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} /> {/* Edit icon */}
        <Skeleton variant="circular" width={32} height={32} /> {/* Menu icon */}
      </Box>
      <Skeleton variant="text" width={260} height={28} sx={{ mb: 2 }} /> {/* Title */}

      {/* Chart area */}
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "end", height: 260, mb: 2, width: "100%", }}>
        {/* Chart bars */}
        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "end", flex: 1, gap: 2, width: "100%" }}>
          {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
          key={i}
          variant="rectangular"
          // Responsive: let flexbox control the width
          sx={{ 
          borderRadius: 1, 
          flex: 1, 
          minWidth: 0, 
          maxWidth: 32 // Optional: limit max width per bar
          }}
          height={120 + Math.round(Math.random() * 80)} // Vary bar heights
          />
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{display: "flex", flexDirection: "row", justifyContent: "center", width: "100%"}}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 1 }}>
          {[1, 2, 3, 4, 5].map((label, i) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Skeleton variant="rectangular" width={18} height={8} sx={{ borderRadius: 1 }} />
              <Skeleton variant="text" width={60} height={12} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
import React from "react";
import { Box, Typography } from "@mui/material";
import tinycolor from "tinycolor2";

export type MapLegendProps = {
  baseColor: string; // e.g. "#22c55e"
  steps?: number;    // default: 5
  width?: number;    // default: 120
  showLabels?: boolean; // default: true
  size?: "small" | "medium" | "large"; // default: medium
};

export function MapLegend({ 
  baseColor, 
  steps = 5, 
  width = 120,
  showLabels = true,
  size = "medium"
}: MapLegendProps) {
  // Generate color variations from dark to light
  const colors = Array.from({ length: steps }, (_, i) =>
    tinycolor(baseColor)
      .lighten((steps - i - 1) * (40 / (steps - 1))) // 0, 10, 20, 30, 40 for 5 steps
      .toHexString()
  );

  return (
    <Box display="flex" alignItems="center" width={width}>
      {showLabels && (
        <Typography variant="body2" color="text.primary" sx={{ mr: size === "small" ? 0.5 : size === "medium" ? 1 : 2 }}>
          0%
        </Typography>
      )}
      <Box display="flex" gap={size === "small" ? 0.25 : size === "medium" ? 0.5 : 1}>
        {colors.map((color, idx) => (
          <Box
            key={color}
            sx={{
              width: size === "small" ? 12 : size === "medium" ? 18 : 24,
              height: size === "small" ? 12 : size === "medium" ? 18 : 24,
              borderRadius: 1,
              background: color,
              // border: "1px solid #222",
              opacity: idx === 0 ? 0.4 : 1, // first is faded 
              transition: "background 0.2s"
            }}
          />
        ))}
      </Box>
      {showLabels && (
        <Typography variant="body2" color="text.primary" sx={{ ml: size === "small" ? 0.5 : size === "medium" ? 1 : 2 }}>
          100%
        </Typography>
      )}
    </Box>
  );
}

export default MapLegend;
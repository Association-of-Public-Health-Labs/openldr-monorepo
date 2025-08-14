import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Tete, TeteProps } from "./Tete";
import { Box, Typography } from "@mui/material";

const meta: Meta<typeof Tete> = {
  title: "DesignSystem/Atoms/Maps/Provinces/Tete",
  component: Tete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
          The **SVGMap** component displays an interactive map with clickable provinces and tooltips. It highlights provinces and shows additional information via indicators.
                  
          ### Features
          - Clickable provinces with customizable tooltips.
          - Indicators to display values for each province.
          - Theme-aware and styled with MUI.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<TeteProps> = (args) => <Tete {...args} />;

export const Default = Template.bind({});
Default.args = {
  onDistrictClick: (districtName) => {
    console.log("districtName", districtName)
  },
  pathDefaultBackgroundColor: "#f0f0f0",
  pathDefaultStrokeColor: "#333",
  highlightedColor: "#00B000",
  districtRatios: {
    'Tete': 0.6, 
    'Angonia': 0.3,
    'Cahora Bassa': 0.8,
    'Changara': 0.1,
    'Chifunde': 0.9, 
  },
  showPopover: true,
  fontSize: "9px",
  getPopoverContent: (districtName, ratio, color) => {
    return (
      <Box>
        <Box sx={{
          backgroundColor: "background.paper",
          p: 1,
          textAlign: "center",
        }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {districtName}
          </Typography>
        </Box>
        <Box sx={{
          p: 1,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}>
          <Box sx={{
            width: "10px",
            height: "10px",
            backgroundColor: color,
            borderRadius: "50%",
          }}>
          </Box>
          <Typography variant="body2" color="text.primary">
            Ratio: {(ratio * 100).toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    )
  },
  legend: "Positividade"
}

import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Inhambane, InhambaneProps } from "./Inhambane";
import { Box, Typography } from "@mui/material";

const meta: Meta<typeof Inhambane> = {
  title: "DesignSystem/Atoms/Maps/Provinces/Inhambane",
  component: Inhambane,
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

const Template: StoryFn<InhambaneProps> = (args) => <Inhambane {...args} />;

export const Default = Template.bind({});
Default.args = {
  onDistrictClick: (districtName) => {
    console.log("districtName", districtName)
  },
  pathDefaultBackgroundColor: "#f0f0f0",
  pathDefaultStrokeColor: "#333",
  highlightedColor: "#00B000",
  districtRatios: {
    'Inhambane': 0.6, 
    'Funhalouro': 0.3,
    'Govuro': 0.8,
    'Homoine': 0.1,
    'Inharrime': 0.9, 
  },
  showPopover: true,
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

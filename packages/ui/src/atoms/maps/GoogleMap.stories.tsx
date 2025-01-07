import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import GoogleMap, { Props } from "./GoogleMap";
import { Box } from "@mui/material";

const meta: Meta<typeof GoogleMap> = {
  title: "DesignSystem/Atoms/Maps/GoogleMap",
  component: GoogleMap,
  parameters: {
    docs: {
      description: {
        component: `
The **GoogleMap** component integrates Google Maps into the application with support for light and dark themes based on the MUI theme. It includes props for adding child components and controlling the zoom level.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => (
  <Box sx={{ height: "400px", width: "100%" }}>
    <GoogleMap {...args} />
  </Box>
);

export const Default = Template.bind({});
Default.args = {
  zoom: 13,
};
Default.parameters = {
  docs: {
    description: {
      story: "Displays the default Google Map centered at a predefined location with zoom level 13.",
    },
  },
};

export const WithMarkers = Template.bind({});
WithMarkers.args = {
  zoom: 12,
  children: (
    <>
      {/* Add custom children for markers */}
      <div
        style={{
          background: "red",
          borderRadius: "50%",
          width: "15px",
          height: "15px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </>
  ),
};
WithMarkers.parameters = {
  docs: {
    description: {
      story: "Demonstrates a map with custom child elements, such as markers or overlays.",
    },
  },
};

export const ThemedMap = Template.bind({});
ThemedMap.args = {
  zoom: 10,
};
ThemedMap.decorators = [
  (Story, context) => (
    <div
      style={{
        height: "400px",
        width: "100%",
        backgroundColor: context.globals.theme === "dark" ? "#303030" : "#fff",
      }}
    >
      {Story()}
    </div>
  ),
];
ThemedMap.parameters = {
  docs: {
    description: {
      story: "Illustrates the map with light and dark themes based on the current MUI theme.",
    },
  },
};

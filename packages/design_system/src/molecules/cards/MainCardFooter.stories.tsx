import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { MainCardFooter, Props } from "./MainCardFooter";
import { Box, Typography, Button } from "@mui/material";

const meta: Meta<typeof MainCardFooter> = {
  title: "DesignSystem/Molecules/Cards/MainCardFooter",
  component: MainCardFooter,
  tags: ["autodocs"],
  argTypes: {
    footerProps: {
      description: "Props for the footer container.",
      control: { type: "object" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
          The **MainCardFooter** component is a styled container that acts as a footer for a card-like structure. It allows for flexible customization and alignment of its content using Material-UI's \`Box\`.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<Props> = (args) => <MainCardFooter {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  footerProps: {
    children: (
      <>
        <Typography variant="body2">Footer Left Content</Typography>
        <Button variant="contained" size="small">
          Footer Right Button
        </Button>
      </>
    ),
  },
};

// Custom Alignment story
export const CenterAligned = Template.bind({});
CenterAligned.args = {
  footerProps: {
    sx: { justifyContent: "center" },
    children: (
      <Typography variant="body2">Centered Footer Content</Typography>
    ),
  },
};

// Custom Background Color story
export const CustomBackground = Template.bind({});
CustomBackground.args = {
  footerProps: {
    sx: { backgroundColor: "primary.main", color: "white", padding: "8px" },
    children: (
      <>
        <Typography variant="body2">Custom Background Footer</Typography>
        <Button variant="text" size="small" color="inherit">
          Action
        </Button>
      </>
    ),
  },
};

// Complex Layout story
export const ComplexLayout = Template.bind({});
ComplexLayout.args = {
  footerProps: {
    sx: { padding: "16px" },
    children: (
      <>
        <Typography variant="body2">Left Content</Typography>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Button variant="outlined" size="small">
            Action 1
          </Button>
          <Button variant="outlined" size="small">
            Action 2
          </Button>
        </Box>
      </>
    ),
  },
};

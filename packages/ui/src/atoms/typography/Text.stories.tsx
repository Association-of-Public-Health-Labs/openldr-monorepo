import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Text } from "./Text";
import { TypographyProps } from "@mui/material";

const meta: Meta<typeof Text> = {
  title: "DesignSystem/Atoms/Typography/Text",
  component: Text,
  argTypes: {
    variant: {
      description: "Typography variant to use.",
      control: { type: "select" },
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "subtitle1",
        "subtitle2",
        "body1",
        "body2",
        "caption",
        "overline",
      ],
    },
    color: {
      description: "The text color.",
      control: { type: "select" },
      options: [
        "initial",
        "inherit",
        "primary",
        "secondary",
        "textPrimary",
        "textSecondary",
        "error",
        "info",
        "success",
        "warning",
      ],
    },
    align: {
      description: "The alignment of the text.",
      control: { type: "select" },
      options: ["inherit", "left", "center", "right", "justify"],
    },
    gutterBottom: {
      description: "If `true`, the text will have a bottom margin.",
      control: { type: "boolean" },
    },
    noWrap: {
      description: "If `true`, the text will not wrap, but instead will truncate with a text overflow ellipsis.",
      control: { type: "boolean" },
    },
    paragraph: {
      description: "If `true`, the text will be rendered as a paragraph element.",
      control: { type: "boolean" },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Text** component is a wrapper around Material-UI's Typography, providing styled text with various variants, colors, and alignments.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<TypographyProps> = (args) => <Text {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  variant: "body1",
  color: "textPrimary",
  align: "left",
  gutterBottom: false,
  noWrap: false,
  paragraph: false,
  children: "This is a sample text.",
};

// Headings story
export const Headings = Template.bind({});
Headings.args = {
  variant: "h1",
  color: "primary",
  children: "This is a heading.",
};

// Custom Alignment story
export const Centered = Template.bind({});
Centered.args = {
  variant: "body1",
  align: "center",
  children: "This text is centered.",
};

// Custom Color story
export const ErrorText = Template.bind({});
ErrorText.args = {
  variant: "body2",
  color: "error",
  children: "This text indicates an error.",
};

// No Wrap story
export const NoWrap = Template.bind({});
NoWrap.args = {
  variant: "body1",
  noWrap: true,
  children: "This text will not wrap and will truncate with ellipsis if it overflows.",
};

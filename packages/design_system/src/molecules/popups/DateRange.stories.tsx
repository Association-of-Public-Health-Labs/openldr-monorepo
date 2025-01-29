import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { DateRange, Props } from "./DateRange";

const meta: Meta<typeof DateRange> = {
  title: "DesignSystem/Molecules/Popups/DateRange",
  component: DateRange,
  tags: ["autodocs"],
  argTypes: {
    onChange: {
      description: "Callback fired when the date range changes.",
      action: "dates-updated",
    },
    initialDates: {
      description: "Initial date range in the format [startDate, endDate].",
      control: { type: "object" },
      defaultValue: ["2023-01-01", "2023-12-31"],
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
### DateRange Component
The **DateRange** component allows users to select a start and end date using two **DatePicker** components. 

- Initial dates can be preloaded using the \`initialDates\` prop.
- Updates to the date range are provided via the \`onChange\` callback.`,
      },
    },
  },
};

export default meta;

// Template for the DateRange component
const Template: StoryFn<Props> = (args) => <DateRange {...args} />;

export const Default = Template.bind({});
Default.args = {
  initialDates: ["2023-01-01", "2023-12-31"],
};

export const CustomInitialDates = Template.bind({});
CustomInitialDates.args = {
  initialDates: ["2022-06-01", "2022-06-30"],
};

export const WithoutInitialDates = Template.bind({});
WithoutInitialDates.args = {
  initialDates: undefined,
};

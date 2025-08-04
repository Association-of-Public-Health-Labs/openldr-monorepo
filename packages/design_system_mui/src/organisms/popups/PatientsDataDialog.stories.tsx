import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { PatientsDataDialog, Props } from "@repo/utilities/components/patients-data-dialog";
import data from "@repo/utilities/app/dashboard/data.json"

export default {
  title: "DesignSystem/Organisms/Popups/PatientsDataDialog",
  component: PatientsDataDialog,
  tags: ["autodocs"],
} as Meta;

const Template: StoryFn<Props> = (args) => <PatientsDataDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  data: data,
  setOpen: () => {},
  loading: false,
};

import React from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import { PatientsDataDialog, Props } from "../../../components/patients-data-dialog";

export default {
  title: "DesignSystem/Organisms/Popups/PatientsDataDialog",
  component: PatientsDataDialog,
  tags: ["autodocs"],
} as Meta;

const Template: StoryFn<Props> = (args) => <PatientsDataDialog {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  data: [],
  setOpen: () => {},
  loading: false,
};

import { Meta, StoryFn } from "@storybook/react";
import { KeyIndicatorsCardProps } from "./KeyIndicatorsCard";
import {FacilitySelector, } from "./FacilitiesSelector";

export default {
  title: "DesignSystem/Organisms/Cards/FacilitiesSelector",
  component: FacilitySelector,
  tags: ["autodocs"],
} as Meta;

const Template: StoryFn<KeyIndicatorsCardProps> = (args) => <FacilitySelector />;

export const Default = Template.bind({});
Default.args = {
};
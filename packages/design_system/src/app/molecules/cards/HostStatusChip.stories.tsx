import { Meta, StoryFn } from "@storybook/react-vite";
import { HostStatusChip, type HostStatusChipProps } from "./HostStatusChip";

const meta: Meta<typeof HostStatusChip> = {
  title: "DesignSystem/Molecules/Cards/HostStatusChip",
  component: HostStatusChip,
  tags: ["autodocs"],
};
export default meta;

const Template: StoryFn<HostStatusChipProps> = (args) => (
  <div className="w-72">
    <HostStatusChip {...args} />
  </div>
);

export const Online = Template.bind({});
Online.args = { name: "HG Machava", code: "PMV", location: "Maputo Província · Matola", online: true, checked: "verificado há 1 min" };

export const Offline = Template.bind({});
Offline.args = { name: "CS 1 de Maio (Maputo)", code: "PMAIO", location: "Maputo Cidade · KaMaxakeni", online: false, checked: "verificado há 3 min", onClick: () => {} };

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
Online.args = { code: "HGM-LAB", name: "Hospital Geral da Machava", category: "Disalab", online: true };

export const Offline = Template.bind({});
Offline.args = { code: "CS-1M", name: "Centro de Saúde 1º de Maio", category: "DisaPoC", online: false, onClick: () => {} };

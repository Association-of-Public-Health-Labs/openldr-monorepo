import { Meta, StoryFn } from '@storybook/react';
import { MainOptions, MainOptionsProps } from './MainOptions';
import { IconlyGrid } from '../../atoms/icons/Grid';
import { IconlyLab } from '../../atoms/icons/Lab';
import { IconlyLocation } from '../../atoms/icons/Location';

const meta: Meta<typeof MainOptions> = {
  title: 'DesignSystem/Molecules/Sidebar/MainOptions',
  component: MainOptions,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: { type: 'select' },
      options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
      description: 'Color theme for the sidebar buttons.',
    },
    variant: {
      control: { type: 'select' },
      options: ['row', 'column'],
      description: 'Layout orientation of the sidebar buttons.',
    },
    options: {
      control: false,
      description: 'List of options for the sidebar.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **MainOptions** component renders a list of navigation options for the sidebar. Each option can have an icon, label, active state, and a link.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<MainOptionsProps> = (args: MainOptionsProps) => <MainOptions {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: 'primary',
  variant: 'column',
  options: [
    { icon: <IconlyGrid style="two-tone"/>, label: 'Sumario', active: true, href: '/summary' },
    { icon: <IconlyLab />, label: 'Laboratorio', active: false, href: '/lab' },
    { icon: <IconlyLocation />, label: 'Provincia', active: false, href: '/province' },
  ],
};

export const RowVariant = Template.bind({});
RowVariant.args = {
  color: 'secondary',
  variant: 'row',
  options: [
    { icon: <IconlyGrid />, label: 'Summary', active: true, href: '/summary' },
    { icon: <IconlyLab />, label: 'Lab', active: false, href: '/lab' },
    { icon: <IconlyLocation />, label: 'Province', active: false, href: '/province' },
  ],
};

export const CustomOptions = Template.bind({});
CustomOptions.args = {
  color: 'success',
  variant: 'column',
  options: [
    { icon: <IconlyGrid />, label: 'Sumario', active: true, href: '/dashboard' },
    { icon: <IconlyLab />, label: 'Laboratorio', active: false, href: '/experiments' },
    { icon: <IconlyLocation />, label: 'Provincia', active: false, href: '/locations' },
  ],
};

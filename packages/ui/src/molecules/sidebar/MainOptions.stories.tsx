import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { MainOptions, Props } from './MainOptions';
import { IoHome, IoFlask, IoLocation } from 'react-icons/io5';

const meta: Meta<typeof MainOptions> = {
  title: 'DesignSystem/Molecules/Sidebar/MainOptions',
  component: MainOptions,
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

const Template: StoryFn<Props> = (args) => <MainOptions {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: 'primary',
  variant: 'column',
  options: [
    { icon: <IoHome />, label: 'Summary', active: true, href: '/summary' },
    { icon: <IoFlask />, label: 'Lab', active: false, href: '/lab' },
    { icon: <IoLocation />, label: 'Province', active: false, href: '/province' },
  ],
};

export const RowVariant = Template.bind({});
RowVariant.args = {
  color: 'secondary',
  variant: 'row',
  options: [
    { icon: <IoHome />, label: 'Summary', active: true, href: '/summary' },
    { icon: <IoFlask />, label: 'Lab', active: false, href: '/lab' },
    { icon: <IoLocation />, label: 'Province', active: false, href: '/province' },
  ],
};

export const CustomOptions = Template.bind({});
CustomOptions.args = {
  color: 'success',
  variant: 'column',
  options: [
    { icon: <IoHome />, label: 'Dashboard', active: true, href: '/dashboard' },
    { icon: <IoFlask />, label: 'Experiments', active: false, href: '/experiments' },
    { icon: <IoLocation />, label: 'Locations', active: false, href: '/locations' },
  ],
};

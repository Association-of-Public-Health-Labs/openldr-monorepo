import React from 'react';
import { StoryFn } from '@storybook/react';
import { MobileSidebar, Props } from './MobileSidebar';
import { MobileOptionsProps } from '../../molecules/sidebar/MobileOptions';
import { IconlyGrid } from '../../atoms/icons/Grid';
import { IconlyLab } from '../../atoms/icons/Lab';
import { IconlyLocation } from '../../atoms/icons/Location';

export default {
  title: 'DesignSystem/Organisms/Sidebar/MobileSidebar',
  component: MobileSidebar,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: {
        type: 'select',
        options: ['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning'],
      },
    },
  },
}

const Template: StoryFn<typeof MobileSidebar> = (args) => (
  <div style={{ width: '100%', height: '60px', backgroundColor: '#f0f0f0' }}>
    <MobileSidebar {...args} />
  </div>
);

const options: MobileOptionsProps[] = [
  {
    label: 'Sumario',
    icon: <IconlyGrid size={18}/>,
    active: true
  },
  {
    label: 'Lab',
    icon: <IconlyLab size={18}/>,
  },
  {
    label: 'Provincia',
    icon: <IconlyLocation size={18}/>,
  },
];

export const Default = Template.bind({});
Default.args = {
  color: 'primary',
  options,
};

export const SecondaryColor = Template.bind({});
SecondaryColor.args = {
  color: 'secondary',
  options,
};

export const CustomOptions = Template.bind({});
CustomOptions.args = {
  color: 'info',
  options,
};

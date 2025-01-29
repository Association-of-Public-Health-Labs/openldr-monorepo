import React from 'react';
import { StoryFn } from '@storybook/react';
import { MobileSidebar, Props } from './MobileSidebar';
import { MobileOptionsProps } from '../../molecules/sidebar/MobileOptions';

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
    label: 'Home',
    icon: <span role="img" aria-label="home">🏠</span>,
    active: true
  },
  {
    label: 'Search',
    icon: <span role="img" aria-label="search">🔍</span>,
  },
  {
    label: 'Profile',
    icon: <span role="img" aria-label="profile">👤</span>,
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
  options: [
    {
      label: 'Settings',
      icon: <span role="img" aria-label="settings">⚙️</span>,
      action: () => alert('Settings clicked'),
    },
    {
      label: 'Notifications',
      icon: <span role="img" aria-label="notifications">🔔</span>,
      action: () => alert('Notifications clicked'),
    },
  ],
};

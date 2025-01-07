import React from 'react';
import { Meta, StoryFn } from "@storybook/react";
import { MainCard } from './MainCard'; 
import { action } from '@storybook/addon-actions';

export default {
  title: 'DesignSystem/Organisms/Cards/MainCard',
  component: MainCard,
  argTypes: {
    width: {
      control: 'text',
      description: 'Width of the card',
      defaultValue: '100%',
    },
    height: {
      control: 'text',
      description: 'Height of the card',
      defaultValue: '100%',
    },
    reportType: {
      control: { type: 'radio' },
      options: ['national', 'lab', 'facility'],
      description: 'Report type for the card',
    },
    labType: {
      control: { type: 'radio' },
      options: ['conventional', 'poc', 'all'],
      description: 'Type of lab for the card',
    },
  },
} as Meta<typeof MainCard>;

const Template: StoryFn<typeof MainCard> = (args) => <MainCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  id: 'default-main-card',
  chartId: 'default-chart',
  title: 'Main Card Title',
  subtitle: 'This is the subtitle for the main card.',
  width: '100%',
  height: '400px',
  reportType: 'national',
  labType: 'conventional',
  loading: false,
  additionalOptions: [
    {
      label: 'View Documentation',
      icon: <span>📄</span>,
      action: action('View Documentation'),
      type: 'secondary',
    },
    {
      label: 'Ask Question',
      icon: <span>❓</span>,
      action: action('Ask Question'),
      type: 'secondary',
    },
  ],
  handleSubmit: action('Handle Submit'),
  children: (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>This is the main content of the card.</p>
    </div>
  ),
  documentation: (
    <div>
      <h3>Documentation</h3>
      <p>This section contains the documentation for the MainCard component.</p>
    </div>
  ),
  user: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
};

export const LoadingState = Template.bind({});
LoadingState.args = {
  ...Default.args,
  loading: true,
};

export const FacilityReport = Template.bind({});
FacilityReport.args = {
  ...Default.args,
  reportType: 'facility',
};

export const LabReport = Template.bind({});
LabReport.args = {
  ...Default.args,
  reportType: 'lab',
  labType: 'poc',
};

import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import { MapLegend } from './MapLegend';

const meta: Meta<typeof MapLegend> = {
  title: "DesignSystem/Atoms/Maps/MapLegend",
  component: MapLegend,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The **SVGMap** component displays an interactive map with clickable provinces and tooltips. It highlights provinces and shows additional information via indicators.
        
### Features
- Clickable provinces with customizable tooltips.
- Indicators to display values for each province.
- Theme-aware and styled with MUI.
        `,
      },
    },
  },
};

export default meta;

const Template: StoryFn<any> = (args) => <MapLegend {...args} />;

export const Default = Template.bind({});
Default.args = {
};

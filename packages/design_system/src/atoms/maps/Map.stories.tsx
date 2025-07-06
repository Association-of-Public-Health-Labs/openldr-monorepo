import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import { SvgMap } from './Map';

const meta: Meta<typeof SvgMap> = {
  title: "DesignSystem/Atoms/Maps/Map",
  component: SvgMap,
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

const Template: StoryFn<any> = (args) => <SvgMap {...args} />;

export const Default = Template.bind({});
Default.args = {
};

// const meta: Meta<typeof SvgMap> = {
//   title: 'DesignSystem/Atoms/Maps/Map',
//   component: SvgMap,
//   parameters: {
//     layout: 'centered',
//     docs: {
//       description: {
//         component: 'An SVG map component that displays a geographical map with customizable styling and interactions.',
//       },
//     },
//   },
//   argTypes: {
//     width: {
//       control: { type: 'text' },
//       description: 'Width of the SVG map',
//       defaultValue: '1em',
//     },
//     height: {
//       control: { type: 'text' },
//       description: 'Height of the SVG map',
//       defaultValue: '1em',
//     },
//     fill: {
//       control: { type: 'color' },
//       description: 'Fill color for SVG elements',
//     },
//     stroke: {
//       control: { type: 'color' },
//       description: 'Stroke color for SVG elements',
//     },
//     strokeWidth: {
//       control: { type: 'number', min: 0, max: 10, step: 0.5 },
//       description: 'Stroke width for SVG elements',
//     },
//     className: {
//       control: { type: 'text' },
//       description: 'CSS class name for styling',
//     },
//     style: {
//       control: { type: 'object' },
//       description: 'Inline styles for the SVG element',
//     },
//     onClick: {
//       action: 'clicked',
//       description: 'Click event handler',
//     },
//     onMouseEnter: {
//       action: 'mouseEnter',
//       description: 'Mouse enter event handler',
//     },
//     onMouseLeave: {
//       action: 'mouseLeave',
//       description: 'Mouse leave event handler',
//     },
//   },
//   tags: ['autodocs'],
// };

// export default meta;
// type Story = StoryObj<typeof meta>;

// // Default story
// export const Default: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//   },
// };

// // Large map
// export const Large: Story = {
//   args: {
//     width: '800px',
//     height: '600px',
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'A larger version of the map for better visibility of details.',
//       },
//     },
//   },
// };

// // Small map
// export const Small: Story = {
//   args: {
//     width: '200px',
//     height: '150px',
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'A compact version of the map suitable for small spaces.',
//       },
//     },
//   },
// };

// // Custom colors
// export const CustomColors: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//     style: {
//       filter: 'hue-rotate(180deg) saturate(1.5)',
//     },
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Map with custom color styling using CSS filters.',
//       },
//     },
//   },
// };

// // Interactive map
// export const Interactive: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//     style: {
//       cursor: 'pointer',
//     },
//     onMouseEnter: () => console.log('Mouse entered map'),
//     onMouseLeave: () => console.log('Mouse left map'),
//     onClick: () => console.log('Map clicked'),
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Interactive map with mouse events and click handling.',
//       },
//     },
//   },
// };

// // Responsive map
// export const Responsive: Story = {
//   args: {
//     width: '100%',
//     height: 'auto',
//     style: {
//       maxWidth: '600px',
//       minHeight: '200px',
//     },
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Responsive map that adapts to container width.',
//       },
//     },
//   },
// };

// // Map with custom styling
// export const CustomStyling: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//     className: 'custom-map',
//     style: {
//       border: '2px solid #333',
//       borderRadius: '8px',
//       boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//     },
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Map with custom border, border radius, and shadow styling.',
//       },
//     },
//   },
// };

// // Dark theme map
// export const DarkTheme: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//     style: {
//       filter: 'invert(1) hue-rotate(180deg)',
//       backgroundColor: '#1a1a1a',
//       padding: '16px',
//       borderRadius: '8px',
//     },
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Map styled for dark theme with inverted colors.',
//       },
//     },
//   },
// };

// // Map with hover effects
// export const WithHoverEffects: Story = {
//   args: {
//     width: '400px',
//     height: '300px',
//     style: {
//       transition: 'transform 0.3s ease, filter 0.3s ease',
//     },
//     onMouseEnter: (e) => {
//       const target = e.currentTarget;
//       target.style.transform = 'scale(1.05)';
//       target.style.filter = 'brightness(1.1)';
//     },
//     onMouseLeave: (e) => {
//       const target = e.currentTarget;
//       target.style.transform = 'scale(1)';
//       target.style.filter = 'brightness(1)';
//     },
//   },
//   parameters: {
//     docs: {
//       description: {
//         story: 'Map with hover effects including scale and brightness changes.',
//       },
//     },
//   },
// };
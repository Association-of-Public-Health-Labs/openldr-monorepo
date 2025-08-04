import React from 'react';
import type { Meta, StoryFn, StoryObj } from "@storybook/react-vite";
import { MainCard } from './MainCard22'; 
import { IoImageOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import { VscDebugRestart } from 'react-icons/vsc';
import { TbMessage2Question } from 'react-icons/tb';
import { SlMagicWand } from 'react-icons/sl';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { HiOutlineDocumentText } from 'react-icons/hi';

export default {
  title: "DesignSystem/Organisms/Cards/MainCard",
  component: MainCard,
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: "text",
      description: "Width of the card",
      defaultValue: "100%",
    },
    height: {
      control: "text",
      description: "Height of the card",
      defaultValue: "100%",
    },
    reportType: {
      control: { type: "radio" },
      options: ["national", "lab", "facility"],
      description: "Report type for the card",
    },
    labType: {
      control: { type: "radio" },
      options: ["conventional", "poc", "all"],
      description: "Type of lab for the card",
    },
    loading: {
      control: { type: "boolean" },
      description: "Loading state for the card",
      defaultValue: false,
    },
  },
  decorators: [
    (Story: any) => (
      <div style={{ width: "800px" }}>
        <Story />
      </div>
    ),
  ],
} as Meta<typeof MainCard>;

const defaultOptions = {
  options: [
    {
      label: "Perguntar a IA",
      icon: <SlMagicWand size={20} />,
      action: () => alert("Info clicked"),
    },
    {
      label: "Editar",
      icon: <FiEdit2 size={20} />,
      action: () => alert("Info clicked"),
    },
  ],
  additionalOptions: [
    {
      label: "Exportar para Excel",
      icon: <PiMicrosoftExcelLogoFill size={20} />,
      action: () => alert("Delete clicked"),
      type: "primary",
    },
    {
      label: "Exportar imagem",
      icon: <IoImageOutline size={20} />,
      action: () => alert("More Info clicked"),
      type: "primary",
    },
    {
      label: "Reiniciar o relatorio",
      icon: <VscDebugRestart size={20} />,
      action: () => alert("More Info clicked"),
      type: "primary",
    },
    {
      label: "Ver a Documentação",
      icon: <HiOutlineDocumentText size={20} />,
      action: () => alert("More Info clicked"),
      type: "secondary",
    },
    {
      label: "Duvidas e Sugestões",
      icon: <TbMessage2Question size={20} />,
      action: () => alert("More Info clicked"),
      type: "secondary",
    },
  ]
}

const Template: StoryFn<typeof MainCard> = (args) => <MainCard {...args} />;

export const Default: StoryObj<typeof MainCard> = Object.assign(Template, {
  args: {
    id: "default-main-card",
    chartId: 'default-chart',
    title: 'Relatorio de Carga Viral',
    subtitle: 'This is the subtitle for the main card.',
    width: '100%',
    height: '400px',
    reportType: 'national',
    labType: 'conventional',
    loading: false,
    headerProps: {
      sx: {
        padding: 2,
      },
    },
    additionalOptions: defaultOptions.additionalOptions,
    handleSubmit: console.log('Handle Submit'),
    children: (
      <div style={{ textAlign: "center" }}>
        
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
  }
});

export const LoadingState: StoryObj<typeof MainCard> = Object.assign(Template, {
  args: {
    ...Default.args,
  }
});

export const FacilityReport: StoryObj<typeof MainCard> = Object.assign(Template, {
  args: {
    ...Default.args,
    reportType: 'facility',
  }
});

export const LabReport: StoryObj<typeof MainCard> = Object.assign(Template, {
  args: {
    ...Default.args,
    reportType: 'lab',
    labType: 'poc',
  }
});

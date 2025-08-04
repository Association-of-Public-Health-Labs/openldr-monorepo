import { Meta, StoryFn } from "@storybook/react";
import { MainCardHeader, MainCardHeaderProps } from "./MainCardHeader";
import { IoSettingsSharp, IoInformationCircleSharp, IoTrash, IoImageOutline } from "react-icons/io5";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { VscDebugRestart } from "react-icons/vsc";
import { FiEdit2 } from "react-icons/fi";
import { SlMagicWand } from "react-icons/sl";

const meta: Meta<typeof MainCardHeader> = {
  title: "DesignSystem/Molecules/Cards/MainCardHeader",
  component: MainCardHeader,
  tags: ["autodocs"],
  argTypes: {
    title: {
      description: "Title of the header.",
      control: { type: "text" },
    },
    subtitle: {
      description: "Subtitle of the header.",
      control: { type: "text" },
    },
    options: {
      description: "Primary action options displayed as icons.",
      control: false,
    },
    additionalOptions: {
      description: "Secondary action options displayed in the dropdown menu.",
      control: false,
    },
    containerProps: {
      description: "Props for the header container box.",
      control: { type: "object" },
    },
    width: {
      description: "Width of the header container.",
      control: { type: "text" },
    },
    handleSetContextOptions: {
      description: "Callback for setting context options.",
      action: "context-options-set",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **MainCardHeader** component is a customizable card header with optional titles, subtitles, icons, and dropdown menus for additional actions. It supports both primary and secondary actions.
        `,
      },
    },
  },
};

export default meta;

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

// Template for the component
const Template: StoryFn<MainCardHeaderProps> = (args) => <MainCardHeader {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
  title: "Main Card Title",
  subtitle: "This is a subtitle",
  options: defaultOptions?.options,
  additionalOptions: defaultOptions.additionalOptions,
  width: "100%",
  containerProps: {
    sx: {
      backgroundColor: "background.paper",
      padding: 2,
    },
  },
};

// No Actions story
export const NoActions = Template.bind({});
NoActions.args = {
  title: "Header Without Actions",
  subtitle: "No primary or additional options.",
  options: [],
  additionalOptions: [],
};

// Custom Background story
export const CustomBackground = Template.bind({});
CustomBackground.args = {
  title: "Custom Background",
  subtitle: "This header has a custom background color.",
  options: defaultOptions?.options,
  additionalOptions: defaultOptions?.additionalOptions,
  containerProps: {
    sx: {
      backgroundColor: "primary.main",
      color: "white",
      padding: 2,
    },
  },
};

// Multiple Additional Options story
export const MultipleAdditionalOptions = Template.bind({});
MultipleAdditionalOptions.args = {
  title: "Header With Multiple Actions",
  subtitle: "Dropdown with multiple options",
  options: defaultOptions?.options,
  additionalOptions: defaultOptions?.additionalOptions,
};

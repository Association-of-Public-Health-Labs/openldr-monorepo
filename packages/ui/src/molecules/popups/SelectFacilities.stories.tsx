import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SelectFacilities, Props } from "./SelectFacilities";
import { optionsProps } from "../../atoms/pickers/Select";

const meta: Meta<typeof SelectFacilities> = {
  title: "DesignSystem/Molecules/Popups/SelectFacilities",
  component: SelectFacilities,
  argTypes: {
    facilityType: {
      description: "Defines which facilities to display: 'province', 'district', or 'clinic'.",
      control: { type: "select" },
      options: ["province", "district", "clinic"],
    },
    allDistricts: {
      description: "List of districts available for selection.",
      control: { type: "object" },
    },
    allClinics: {
      description: "List of clinics available for selection.",
      control: { type: "object" },
    },
    isMulti: {
      description: "Allows multiple selections.",
      control: { type: "boolean" },
    },
    width: {
      description: "Defines the width of the component.",
      control: { type: "text" },
      defaultValue: "100%",
    },
    onChange: {
      description: "Callback fired when the selection changes.",
      action: "selection-changed",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **SelectFacilities** component allows users to select facilities such as provinces, districts, or clinics based on the selected type.

### Features:
- Dynamic filtering of options (districts and clinics) based on parent selections.
- Supports single and multi-select modes.
- Callback \`onChange\` for handling selection changes.
        `,
      },
    },
  },
};

export default meta;

// Dummy data for stories
const allDistricts: optionsProps[] = [
  { value: "Maputo Cidade", label: "Maputo Cidade", province: "Maputo Cidade" },
  { value: "Matola", label: "Matola", province: "Maputo Provincia" },
  { value: "Xai-Xai", label: "Xai-Xai", province: "Gaza" },
];

const allClinics: optionsProps[] = [
  { value: "Hospital Central", label: "Hospital Central", district: "Maputo Cidade" },
  { value: "Clinica Matola", label: "Clinica Matola", district: "Matola" },
  { value: "US Xai-Xai", label: "US Xai-Xai", district: "Xai-Xai" },
];

// Template for the SelectFacilities component
const Template: StoryFn<Props> = (args) => <SelectFacilities {...args} />;

// Province only selection
export const ProvinceSelection = Template.bind({});
ProvinceSelection.args = {
  facilityType: "province",
  allDistricts: [],
  allClinics: [],
  isMulti: false,
};

// District selection
export const DistrictSelection = Template.bind({});
DistrictSelection.args = {
  facilityType: "district",
  allDistricts,
  allClinics: [],
  isMulti: true,
};

// Clinic selection
export const ClinicSelection = Template.bind({});
ClinicSelection.args = {
  facilityType: "clinic",
  allDistricts,
  allClinics,
  isMulti: false,
};

// Multi-selection mode
export const MultiSelection = Template.bind({});
MultiSelection.args = {
  facilityType: "district",
  allDistricts,
  allClinics,
  isMulti: true,
};

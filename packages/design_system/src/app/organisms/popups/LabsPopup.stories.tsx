import { Meta, StoryFn } from "@storybook/react-vite";
import { LabsPopup, type LabsPopupProps } from "./LabsPopup";

export default {
  title: "DesignSystem/Organisms/Popups/LabsPopup",
  component: LabsPopup,
  tags: ["autodocs"],
} as Meta;

const facilities = {
  clinics: [],
  districts: [],
  labs: [
    {
      DateTimeStamp: new Date(),
      VersionStamp: "v1",
      LIMSVendorCode: "L001",
      LabCode: "LAB001",
      FacilityCode: "FAC001",
      LabName: "Central Lab",
      LabType: "conventional",
      StaffingLevel: "High",
    },
    {
      DateTimeStamp: new Date(),
      VersionStamp: "v2",
      LIMSVendorCode: "L002",
      LabCode: "LAB002",
      FacilityCode: "FAC002",
      LabName: "Regional Lab",
      LabType: "conventional",
      StaffingLevel: "Medium",
    },
  ],
  pocs: [
    {
      DisaPocCode: "POC001",
      DisaPocName: "POC A",
      DisaPocNationalCode: "NPOC001",
      DisaPocLabNo: "001",
      DisaPocPrefix: "P001",
      DisaPocProvinceName: "Province A",
      DisapocDistrictName: "District A",
      DisaPocLicence: "Active",
    },
  ],
};

const Template: StoryFn<LabsPopupProps> = (args: LabsPopupProps) => <LabsPopup {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  facilities,
  handleSubmit: (labs, dates, labType) =>
    console.log("Selected Labs:", labs, "Dates:", dates, "Lab Type:", labType),
  initialDates: [
    "2024-01-01",
    "2024-12-31"
  ],
  onClose: () => console.log("LabsPopup Closed"),
};

export const ConventionalLabsOnly = Template.bind({});
ConventionalLabsOnly.args = {
  open: true,
  facilities,
  handleSubmit: (labs, dates, labType) =>
    console.log("Selected Labs:", labs, "Dates:", dates, "Lab Type:", labType),
  labType: "conventional",
  initialDates: [
    "2024-01-01",
    "2024-12-31"
  ],
  onClose: () => console.log("LabsPopup Closed"),
};

export const PocLabsOnly = Template.bind({});
PocLabsOnly.args = {
  open: true,
  facilities,
  handleSubmit: (labs, dates, labType) =>
    console.log("Selected Labs:", labs, "Dates:", dates, "Lab Type:", labType),
  labType: "poc",
  initialDates: [
    "2024-01-01",
    "2024-12-31"
  ],
  onClose: () => console.log("LabsPopup Closed"),
};

export const AllLabsSelected = Template.bind({});
AllLabsSelected.args = {
  open: true,
  facilities,
  handleSubmit: (labs, dates, labType) =>
    console.log("Selected Labs:", labs, "Dates:", dates, "Lab Type:", labType),
  initialDates: ["2024-01-01", "2024-12-31"],
  labType: "all",
  onClose: () => console.log("LabsPopup Closed"),
};

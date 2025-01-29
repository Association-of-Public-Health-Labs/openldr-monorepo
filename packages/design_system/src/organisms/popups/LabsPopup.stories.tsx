import { Meta, StoryFn } from "@storybook/react";
import { LabsPopup, Props } from "./LabsPopup";
import { FacilitiesProps } from "../../types/facilities";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import moment from "moment";

export default {
  title: "DesignSystem/Organisms/Popups/LabsPopup",
  component: LabsPopup,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <div style={{ padding: "16px", height: "100vh", position: "relative" }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} as Meta;

const facilities: FacilitiesProps = {
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

const Template: StoryFn<Props> = (args) => <LabsPopup {...args} />;

export const Default = Template.bind({});
Default.args = {
  open: true,
  facilities,
  handleSubmit: (labs, dates, labType) =>
    console.log("Selected Labs:", labs, "Dates:", dates, "Lab Type:", labType),
  initialDates: [
    moment().subtract(1, "year").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
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
    moment().subtract(1, "year").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
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
    moment().subtract(1, "year").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
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

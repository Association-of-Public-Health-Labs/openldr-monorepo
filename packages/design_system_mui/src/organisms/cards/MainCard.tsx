import React, { useState, createRef, useCallback } from "react";
import {
  Box,
  BoxProps,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  FiEdit2,
} from "react-icons/fi";
import { useScreenshot } from "use-react-screenshot";

import { CardProvider, CsvFileProps } from "../../contexts/CardContext";
import { DateRange } from "../../organisms/popups/DateRange";
import { FacilitiesPopup } from "../../organisms/popups/FacilitiesPopup";
import { LabsPopup } from "../../organisms/popups/LabsPopup";
import { MainCardHeader as Header, MainCardHeaderOptions } from "../../molecules/cards/MainCardHeader";
import { SelectPickerOptionsProps } from "../../atoms/pickers/SelectPicker";
import { SyncLoader } from "react-spinners";

export type MainCardProps = {
  id?: string;
  chartId?: string;
  title?: string;
  subtitle?: string;
  width?: string | number;
  height?: string | number;
  reportType?: "national" | "lab" | "facility";
  labType?: "conventional" | "poc";
  additionalOptions?: MainCardHeaderOptions[];
  children?: React.ReactNode;
  containerProps?: BoxProps;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerComponent?: React.ReactNode;
  loading?: boolean;
  documentation?: React.ReactNode;
  handleSubmit?: (
    dates: [string, string],
    facilities?: SelectPickerOptionsProps[],
    facilityType?: "province" | "district" | "clinic",
    disaggregation?: "true" | "false",
    labType?: "conventional" | "poc" | "all"
  ) => void;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  csvFile?: CsvFileProps;
};

type CommentsType = "doubt" | "suggestion";

export function MainCard(props: MainCardProps) {
  const {
    id,
    chartId,
    title,
    subtitle,
    width,
    height,
    reportType,
    labType,
    additionalOptions = [],
    handleSubmit,
    loading,
    children,
    documentation,
    containerProps,
    headerProps,
    bodyProps,
    footerComponent,
    user,
    csvFile
  } = props;

  const ref = createRef<HTMLDivElement>();
  const [openDialog, setOpenDialog] = useState(false);
  const [commentsType, setCommentsType] = useState<CommentsType>("doubt");
  const [comment, setComment] = useState<string | null>(null);
  const [image, takeScreenshot] = useScreenshot();
  const [dialogOptions, setDialogOptions] = useState({
    documentation: false,
    suggestions: false,
  });
  const theme = useTheme();

  const handleOpenDialog = useCallback((type: "documentation" | "suggestions") => {
    setOpenDialog(true);
    setDialogOptions({
      documentation: type === "documentation",
      suggestions: type === "suggestions",
    });
  }, []);

  const handleCloseDialog = () => setOpenDialog(false);

  const handleCommentsChange = (_: React.MouseEvent<HTMLElement>, type: CommentsType) => {
    setCommentsType(type);
  };

  return (
    <CardProvider csvFile={csvFile}>
      <Box
        sx={{
          width,
          height,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: 0.5,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : theme.palette.background.paper,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          ...containerProps?.sx,
        }}
        {...containerProps}
      >
        <Header
          title={title}
          subtitle={subtitle}
          options={[
            {
              label: "Editar",
              action: () => handleOpenDialog("documentation"),
              icon: <FiEdit2 size={18} />,
            }
          ]}
          additionalOptions={additionalOptions}
          containerProps={headerProps}
          handleSetContextOptions={(options) => console.log(options)}
        />
        <Box ref={ref} sx={{ flex: 1, ...bodyProps?.sx }} {...bodyProps}>
          {children}
        </Box>
        {footerComponent && (
          <Box sx={{
            borderTop: "1px dashed",
            borderColor: "divider",
            padding: 2,
          }}>
            {footerComponent}
          </Box>
        )}
        
        {reportType === "national" && (
          <DateRange
            open={openDialog}
            handleSubmit={(dates) => handleSubmit?.(dates)}
            onClose={handleCloseDialog}
          />
        )}
        {reportType === "facility" && (
          <FacilitiesPopup
            open={openDialog}
            handleSubmit={(facilities, facilityType, dates) =>
              handleSubmit?.(dates, facilities, facilityType)
            }
            onClose={handleCloseDialog}
            facilities={{clinics: [], districts: [], labs: [], pocs: []}}
            isMulti={true}
          />
        )}
        {reportType === "lab" && (
          <LabsPopup
            open={openDialog}
            handleSubmit={(labs, dates, labType) =>
              handleSubmit?.(dates, labs, "province", undefined, labType)
            }
            facilities={{clinics: [], districts: [], labs: [], pocs: []}}
            onClose={handleCloseDialog}
            labType={labType}
          />
        )}
      {loading && (
        <Box sx={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <SyncLoader color="#fff" size={8} />
        </Box>
      )}
      </Box>
    </CardProvider>
  );
}

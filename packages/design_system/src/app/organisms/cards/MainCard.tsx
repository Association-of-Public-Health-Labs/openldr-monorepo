import React, { useState, createRef, useCallback } from "react";
import {
  Box,
  BoxProps,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  FiEdit2,
  FiMessageSquare,
} from "react-icons/fi";
import { format } from "date-fns";

import { DateRange } from "../../organisms/popups/DateRange";
import { FacilitiesPopup } from "../../organisms/popups/FacilitiesPopup";
import { LabDialog } from "../../organisms/popups/LabDialog";
import { MainCardHeader as Header, MainCardHeaderOptions } from "../../molecules/cards/MainCardHeader";
import { SelectPickerOptionsProps } from "../../atoms/pickers/SelectPicker";
import { SyncLoader } from "react-spinners";
import { CardDocsPopup } from "../popups/CardDocsPopup";
import { SuggestionsPopup } from "../popups/SuggestionsPopup";
import { TbMessage2Question } from "react-icons/tb";
import { HiOutlineDocumentText } from "react-icons/hi";
import { CardContainer } from "@repo/design_system_mui";

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
  csvFile?: any;
  previewMode?: boolean;
  disableDefaultCardActions?: boolean;
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
    csvFile,
    disableDefaultCardActions = false,
  } = props;

  const ref = createRef<HTMLDivElement>();
  const [openDialog, setOpenDialog] = useState(false);
  const [openDocumentationDialog, setOpenDocumentationDialog] = useState(false);
  const [openSuggestionsDialog, setOpenSuggestionsDialog] = useState(false);
  const [commentsType, setCommentsType] = useState<CommentsType>("doubt");
  const [comment, setComment] = useState<string | null>(null);
  const [dialogOptions, setDialogOptions] = useState({
    documentation: false,
    suggestions: false,
  });
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSuggestionsSubmit = async (content: string, category: "suggestion" | "doubt") => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/send-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          category,
          reportTitle: title || 'Relatório',
          userEmail: user?.email || 'unknown@example.com',
          userName: user?.name || 'Unknown User',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send suggestion');
      }

      // Show success message
      console.log('Suggestion sent successfully');
      
    } catch (error) {
      console.error('Error sending suggestion:', error);
      // Handle error (show toast notification, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // <CardProvider csvFile={csvFile}>
    <>
      {openDocumentationDialog && (
        <CardDocsPopup 
          open={openDocumentationDialog}
          setOpen={setOpenDocumentationDialog}
          documentation={documentation}
        >
          <MainCardContent
            {...props}
            previewMode={true}
          />
        </CardDocsPopup>  
      )}
      {openSuggestionsDialog && (
        <SuggestionsPopup
          open={openSuggestionsDialog}
          setOpen={setOpenSuggestionsDialog}
          onSubmit={handleSuggestionsSubmit}
          loading={isSubmitting}
        >
          <MainCardContent
            {...props}
            previewMode={true}
          />
        </SuggestionsPopup>
      )}
      <CardContainer
        // width={width}
        // height={height}
        // sx={containerProps?.sx}
        {...containerProps}
        sx={{
          width,
          height,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: 0.5,
          // backgroundColor: "background.paper",
          // backgroundColor: (theme) =>
          //   theme.palette.mode === "dark"
          //     ? theme.palette.background.default
          //     : theme.palette.background.paper,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          ...containerProps?.sx,
        }}
      >
        <MainCardContent
          {...props}
          additionalOptions={[
            ...additionalOptions,
            ...(!disableDefaultCardActions
              ? [
                  {
                    label: "Ver a Documentação",
                    icon: <HiOutlineDocumentText size={18} />,
                    action: () => {
                      setOpenDocumentationDialog(true);
                    },
                    disabled: false,
                    optionToExportData: false,
                    type: "secondary" as const,
                  },
                  {
                    label: "Dúvidas e Sugestões",
                    icon: <TbMessage2Question size={18} />,
                    action: () => {
                      setOpenSuggestionsDialog(true);
                    },
                    type: "secondary" as const,
                  },
                ]
              : []),
          ]}
        />
      </CardContainer>
      {/* <Box
        sx={{
          width,
          height,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: 0.5,
          backgroundColor: "background.paper",
          // backgroundColor: (theme) =>
          //   theme.palette.mode === "dark"
          //     ? theme.palette.background.default
          //     : theme.palette.background.paper,
          overflow: "hidden",
          position: "relative",
          border: "1px solid",
          borderColor: "divider",
          ...containerProps?.sx,
        }}
        {...containerProps}
      >
        <MainCardContent
          {...props}
          additionalOptions={[
            ...additionalOptions,
            {
              label: "Ver a Documentação",
              icon: <HiOutlineDocumentText size={18} />,
              action: () => {
                setOpenDocumentationDialog(true);
              },
              disabled: false,
              optionToExportData: false,
              type: "secondary"
            },
            {
              label: "Dúvidas e Sugestões",
              icon: <TbMessage2Question size={18} />,
              action: () => {
                setOpenSuggestionsDialog(true);
              },
              type: "secondary"
            }
          ]}
        />
      </Box> */}
    </>
    // </CardProvider>
  );
}

function MainCardContent(props: MainCardProps) {
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
    csvFile,
    previewMode = false,
    disableDefaultCardActions = false,
  } = props;

  const ref = createRef<HTMLDivElement>();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogOptions, setDialogOptions] = useState({
    documentation: false,
    suggestions: false,
  });

  const handleOpenDialog = useCallback((type: "documentation" | "suggestions") => {
    setOpenDialog(true);
    setDialogOptions({
      documentation: type === "documentation",
      suggestions: type === "suggestions",
    });
  }, []);

  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <>
      <Header
        title={title}
        subtitle={subtitle}
        options={previewMode || disableDefaultCardActions ? [] : [
          {
            label: "Editar",
            action: () => handleOpenDialog("documentation"),
            icon: <FiEdit2 size={18} />,
          }
        ]}
        additionalOptions={previewMode ? [] : additionalOptions}
        containerProps={headerProps}
        handleSetContextOptions={(options) => {}}
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
        <LabDialog 
          onCancel={handleCloseDialog} 
          onApply={(params) => handleSubmit?.(
            [
              params?.date?.from ? format(params.date.from, "yyyy-MM-dd") : "",
              params?.date?.to ? format(params.date.to, "yyyy-MM-dd") : ""
            ], 
            params?.selectedDistricts, undefined, undefined, undefined
          )} 
          open={openDialog}
          setOpen={setOpenDialog}
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
    </>
  )
}

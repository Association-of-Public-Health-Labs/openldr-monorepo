import React, { useState, createRef, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  BoxProps,
} from "@mui/material";
import {
  FiEdit2,
} from "react-icons/fi";
import {
  IoDocumentTextOutline,
} from "react-icons/io5";
import {
  GoInfo,
} from "react-icons/go";
import {
  BsQuestionLg,
} from "react-icons/bs";
import Scrollbar from "react-perfect-scrollbar";
import { useScreenshot } from "use-react-screenshot";

import { CardProvider, CsvFileProps } from "../../contexts/CardContext";
import { DocsProvider } from "../../contexts/DocsContext";
import { DateRange } from "../../organisms/popups/DateRange";
import { FacilitiesPopup } from "../../organisms/popups/FacilitiesPopup";
import { LabsPopup } from "../../organisms/popups/LabsPopup";
import { MainCardHeader as Header, Options } from "../../molecules/cards/MainCardHeader";
import { Dialog } from "../../atoms/modals/Dialog";
import { TextField } from "../../atoms/inputs/TextField";
import { Button } from "../../atoms/inputs/Button";
import { optionsProps } from "../../atoms/pickers/Select";

export type Props = {
  id?: string;
  chartId?: string;
  title?: string;
  subtitle?: string;
  width?: string | number;
  height?: string | number;
  reportType?: "national" | "lab" | "facility";
  labType?: "conventional" | "poc";
  additionalOptions?: Options[];
  children?: React.ReactNode;
  containerProps?: BoxProps;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerComponent?: React.ReactNode;
  loading?: boolean;
  documentation?: React.ReactNode;
  handleSubmit?: (
    dates: [string, string],
    facilities?: optionsProps[],
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

export function MainCard(props: Props) {
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
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          boxShadow: 1,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : theme.palette.background.paper,
          overflow: "hidden",
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
            },
            ...additionalOptions,
            {
              label: "Ver Documentação",
              action: () => handleOpenDialog("documentation"),
              icon: <IoDocumentTextOutline size={18} />,
              type: "secondary",
            },
            {
              label: "Dúvidas e Sugestões",
              action: async () => {
                await takeScreenshot(ref.current);
                handleOpenDialog("suggestions");
              },
              icon: <GoInfo size={18} />,
              type: "secondary",
            },
          ]}
          containerProps={headerProps}
          handleSetContextOptions={(options) => console.log(options)}
        />
        <Box ref={ref} sx={{ flex: 1, ...bodyProps?.sx }} {...bodyProps}>
          {children}
        </Box>
        {footerComponent}

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
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg">
        <Grid container>
          <Grid item xs={12} md={7} sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                backgroundColor: "transparent",
                boxShadow: 0,
                height: "100%",
              }}
            >
              {children}
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Scrollbar
              style={{
                borderLeft: "1px dashed rgba(145, 158, 171, 0.24)",
                padding: "3%",
                height: "510px",
                overflowY: "auto",
              }}
            >
              {dialogOptions.documentation && <DocsProvider>{documentation}</DocsProvider>}
              {dialogOptions.suggestions && (
                <Box>
                  <Typography variant="h5" sx={{ marginBottom: 2 }}>
                    Dúvidas e Sugestões
                  </Typography>
                  <ToggleButtonGroup
                    value={commentsType}
                    exclusive
                    onChange={handleCommentsChange}
                    sx={{ marginBottom: 2 }}
                  >
                    <ToggleButton value="doubt">
                      <BsQuestionLg style={{ marginRight: 8 }} /> Dúvida
                    </ToggleButton>
                    <ToggleButton value="suggestion">
                      <GoInfo style={{ marginRight: 8 }} /> Sugestão
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    label={`Por favor, coloque a sua ${commentsType === "doubt" ? "dúvida" : "sugestão"}`}
                    multiline
                    rows={4}
                    fullWidth
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 2 }}>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button
                      variant="contained"
                      onClick={() => alert("Comentário enviado")}
                    >
                      Enviar
                    </Button>
                  </Box>
                </Box>
              )}
            </Scrollbar>
          </Grid>
        </Grid>
      </Dialog>
    </CardProvider>
  );
}

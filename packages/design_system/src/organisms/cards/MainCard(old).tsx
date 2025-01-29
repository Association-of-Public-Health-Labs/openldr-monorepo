import React, { useState, ReactNode, createRef } from "react";
import { Box as Body, Box, BoxProps, Grid, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FiEdit2 } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { GoInfo } from "react-icons/go";
import { GrInfo } from "react-icons/gr";
import Scrollbar from "react-perfect-scrollbar";
import { useScreenshot } from 'use-react-screenshot'

import {CardProvider, CsvFileProps} from "../../contexts/CardContext";
import { DocsProvider } from "../../contexts/DocsContext";

import {DateRange} from "../../organisms/popups/DateRange";
import {FacilitiesPopup} from "../../organisms/popups/FacilitiesPopup";
import {LabsPopup} from "../../organisms/popups/LabsPopup";
import {MainCardHeader as Header, Options} from "../../molecules/cards/MainCardHeader";
import {Dialog} from "../../atoms/modals/Dialog";
import {TextField} from "../../atoms/inputs/TextField";
import {Button} from "../../atoms/inputs/Button";
// import {Loader} from "../../molecules/feedback/Loader";

import { BsQuestionLg } from "react-icons/bs";

import {optionsProps} from "../../atoms/pickers/Select";

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
  children?: ReactNode;
  containerProps?: BoxProps;
  headerProps?: BoxProps;
  bodyProps?: BoxProps;
  footerComponent?: ReactNode;
  loading?: boolean;
  documentation?: any;
  csvFile?: CsvFileProps;
  handleSubmit?: (
    dates: [string, string], 
    facilities?: optionsProps[], 
    facilityType?: "province" | "district" | "clinic",
    disaggregation?: "true" | "false",
    labType?: "conventional" | "poc" | "all"
  ) => void;
  user: {
    name: string,
    email: string,
    avatar?: string
  }
}

type CommentsType = "doubt" | "suggestion";

function Card (props: Props) {
  const [openPopup, setOpenPopup] = useState(false);
  const {loading, handleSubmit} = props;
 
  const handleOpenPopup = () => {
    setOpenPopup(true);
  }
  
  return (
    <Box 
      sx={{
        width: props?.width, 
        height: props?.height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
        borderRadius: "16px",
        padding: 3,
        paddingLeft: 4,
        paddingRight: 4,
        position: "relative",
        overflow: "hidden",
        boxShadow: 1,
        ...(props?.containerProps?.sx)
      }}
      id={props?.id}
    >
      <Header 
        title={props?.title}
        subtitle={props?.subtitle}
        width="100%"
        options={[{
          label: "Editar",
          action: () => handleOpenPopup(),
          icon: <FiEdit2 size={18}/>
        }]}
        additionalOptions={props?.additionalOptions}
        containerProps={props?.headerProps}
        handleSetContextOptions={(options) => console.log(options)}
      />
      <Body 
        id={props?.chartId} 
        {...props?.bodyProps}
        sx={{width: "100%", padding: 0, flex: 1, ...props?.bodyProps?.sx}}
      >
        {props?.children}
      </Body> 
      {props?.footerComponent}
      <DateRange 
        open={props?.reportType === "national" && openPopup}
        handleSubmit={(dates) => { 
          handleOpenPopup(); 
          handleSubmit && handleSubmit(dates);
        }}
        onClose={() => setOpenPopup(false)}
      />
      <FacilitiesPopup 
        open={props?.reportType === "facility" && openPopup}
        handleSubmit={(facilities, facilityType, dates) => {
          handleSubmit && handleSubmit(dates, facilities, facilityType);
        }}
        onClose={() => setOpenPopup(false)}
        facilities={{clinics: [], districts: [], labs: [], pocs: []}}
      />
      <LabsPopup 
        open={props?.reportType === "lab" && openPopup}
        handleSubmit={(labs, dates, labType) => {
          handleSubmit && handleSubmit(dates, labs,"province", undefined, labType);
        }}
        onClose={() => setOpenPopup(false)}
        labType={props?.labType}
        facilities={{clinics: [], districts: [], labs: [], pocs: []}}
      />
      {/* <Loader sx={{display: loading ? "flex" : "none"}}/> */}
    </Box>
  )
}

export function MainCard({id, chartId, title, subtitle, width, height, reportType, labType, additionalOptions, handleSubmit, loading, children, documentation, containerProps, headerProps, bodyProps, footerComponent, csvFile, user}: Props) {
  const ref = createRef<HTMLDivElement>();
  const [openDialog, setOpenDialog] = useState(false);
  const [commentsType, setCommentsType] = useState<CommentsType>("doubt");
  const [comment, setComment] = useState(null);
  const [image, takeScreenshot] = useScreenshot();
  const [dialogOptions, setDialogOptions] = useState({
    documentation: false,
    suggestions: false,
  });
  const getImage = async () => await takeScreenshot(ref.current)

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChangeCommentsType = (
    event: React.MouseEvent<HTMLElement>,
    commentsType: CommentsType,
  ) => {
    setCommentsType(commentsType);
  };

  return (
    <CardProvider csvFile={csvFile}>
      <Card 
        id={id}
        title = {title}
        subtitle = {subtitle}
        width = {width}
        height = {height}
        reportType = {reportType}
        labType={labType}
        loading={loading}
        handleSubmit={handleSubmit}
        headerProps={headerProps}
        bodyProps={bodyProps}
        footerComponent={footerComponent}
        additionalOptions = {[
          ...additionalOptions,
          {
            label: "Ver a Documentação",
            icon: <IoDocumentTextOutline size={18}/>,
            action: () => {
              handleClickOpenDialog();
              setDialogOptions({documentation: true, suggestions: false});
            },
            type: "secondary"
          },
          {
            label: "Dúvidas e Sugestões",
            icon: <GrInfo size={18}/>,
            action: async () => {
              handleClickOpenDialog();
              await getImage();
              setDialogOptions({documentation: false, suggestions: true});
            },
            type: "secondary"
          }
        ]}
        containerProps={{
          ...containerProps,
          sx: {
            display: openDialog ? "none": "flex",
            ...containerProps?.sx
          }
        }} 
        user={user}
      >
        <div ref={ref}>
          {children}
        </div>
      </Card>
      <Dialog 
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
      >
        <Box sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          height: "450px",
          padding: 0
        }}>
          <Grid container spacing={0}>
            <Grid item md={7} sx={{
              display: {xs: "none", md: "block"}
            }}>
              <Card 
                title = {title}
                subtitle = {subtitle}
                width = {width}
                height = {height}
                reportType = {reportType}
                additionalOptions = {additionalOptions} 
                containerProps={{
                  sx: {
                    boxShadow: 0,
                    backgroundColor: "transparent",
                    flex: 1,
                    height: "100%",
                  }
                }}
                user={user}
              >
                
                  {children}
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box style={{
                flex: 1,
                borderLeft: "1px dashed rgba(145, 158, 171, 0.24)",
                padding: 1,
                paddingLeft: "3%",
                paddingRight: "3%",
                overflowY: "auto",
                height: "510px"
              }}>
                {dialogOptions?.documentation && (
                  <DocsProvider>
                    {documentation}
                  </DocsProvider>
                )}
                {dialogOptions?.suggestions && (
                  user ?
                    <Box sx={{
                      paddingTop: 2
                    }}>
                      <Typography variant="h5" sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        fontSize: "1.17em",
                        marginBottom: 1
                      }}>
                        Dúvidas e Sugestões
                      </Typography>
                      <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        marginBottom: 1
                      }}>
                        <Typography sx={{
                          color: "text.secondary",
                        }}>
                          Logado como: 
                        </Typography>
                        <Typography sx={{
                          color: "text.secondary",
                          fontWeight: "bold",
                          marginLeft: 1
                        }}>
                          {user?.email}
                        </Typography>
                      </Box>
                      <Typography sx={{
                        color: "text.primary",
                        marginBottom: 2
                      }}>
                        Nesta sessão poderás colocar dúvidas ou sugestões sobre a plataforma. No campo que segue selecione a categoria pretendida
                      </Typography>
                      <Box sx={{
                        marginBottom: 2
                      }}>
                        <ToggleButtonGroup
                          color="primary"
                          value={commentsType}
                          exclusive
                          onChange={handleChangeCommentsType}
                          sx={{
                            gap: 2
                          }}
                        >
                          <ToggleButton 
                            value="doubt"
                            sx={{
                              borderRadius: "12px !important",
                              border: "none"
                            }}
                          >
                            <BsQuestionLg style={{marginRight: 2}}/>Dúvida
                          </ToggleButton>
                          <ToggleButton 
                            value="suggestion"
                            sx={{
                              borderRadius: "12px !important",
                              border: "none"
                            }}
                          >
                            <GoInfo style={{marginRight: 2}} size={22}/>Sugestão
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                      <TextField
                        id="outlined-multiline-static"
                        label={ `Por favor, coloque a sua ${commentsType === "doubt" ? "dúvida" : "sugestão"}` }
                        multiline
                        rows={4}
                        onChange={e => setComment(e.target.value)}
                        fullWidth={true}
                      />
                      <Box sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 2,
                        gap: 2
                      }}>
                        <Button 
                          variant="text"
                          size="large"
                          onClick={handleCloseDialog}
                        >Cancelar</Button>
                        <Button 
                          variant="contained"
                          size="large"
                          sx={{color: "white"}}
                          onClick={() => alert("Send a comment")}
                        >Enviar</Button>
                      </Box>
                    </Box>
                  :
                    <Box sx={{
                      flexDirection: "column",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      width: "100%",
                    }}>
                      <Typography variant="h5" sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        fontSize: "1.17em",
                        marginBottom: 3
                      }}>
                        Dúvidas e Sugestões
                      </Typography>
                      <Typography sx={{
                        color: "text.primary",
                        textAlign: "center",
                        marginBottom: 2
                      }}>
                        Para enviar dúvidas e/ou sugestões é necessário estar autenticado 
                      </Typography>
                      <Button 
                          variant="contained"
                          size="large"
                          href="/api/auth/login"
                          sx={{color: "white"}}
                      >Aceder a conta</Button>
                    </Box>  
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </CardProvider>
  );
}
import { useState, useEffect } from "react";
import hexToRgba from "hex-to-rgba";
import { Box, Box as Header, Divider, Drawer, IconButton, Typography, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

import {AnimatedMapIcon} from "../../atoms/maps/AnimatedMapIcon";
import { IoChevronForwardSharp, IoClose } from "react-icons/io5";

import { RoutesProps } from "../../types/facilities";

export type MapDrawerProps = {
  openMapDrawer: boolean;
  onClose: () => void;
  route: RoutesProps;
}

export function MapDrawer ({openMapDrawer, onClose, route}: MapDrawerProps) {
  const [open, setOpen] = useState(openMapDrawer);
  const {palette} = useTheme();

  useEffect(() => {
    setOpen(openMapDrawer);
  },[openMapDrawer])

  const toggleDrawer = (open: boolean) =>
    (event: KeyboardEvent | MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as KeyboardEvent).key === "Tab" ||
          (event as KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setOpen(open);
      // !open && onClose();
  };
  
  return (
    <Drawer
      anchor={"bottom"}
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        // height: "100px",
        backgroundColor: "transparent",
        "& .MuiBackdrop-root": {
          backgroundColor: "transparent"
        },
        "& .MuiPaper-root.MuiPaper-elevation": {
          backdropFilter: "blur(6px)",
          backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.8"),
          borderRadius: "12px",
          width: "40%",
          left: "30%",
          // top: "10%",
          boxShadow: 2,
          marginBottom: 2,
        }
      }}
    >
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1
      }}>
        <Header sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px dashed rgba(145, 158, 171, 0.24)",
          padding: 0.5,
          paddingLeft: 1,
          paddingRight: 1,
        }}>
          <Typography fontSize={16} variant="h6">Rota das amostras</Typography>
          <IconButton 
            aria-label="close"
            onClick={() => {
              toggleDrawer(false);
              onClose();
            }}
          >
            <IoClose />
          </IconButton>
        </Header>
        <Box sx={{
          flex: "1",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 2,
        }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "70px",
            
          }}>
            <Box sx={{
              position: "relative", 
              height: "40px",
              width: "20px",
              marginLeft: "30px",
              margin: 0,
            }}>
              <AnimatedMapIcon/>
            </Box>
            <Typography 
              variant="h6" 
              sx={{
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {route?.facilityName}
            </Typography>
          </Box>
          <Box sx={{
              flex: 1, 
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start"
            }}>
              <Typography 
                variant="h6" 
                sx={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold"
                }}
              >
                {route?.totalSamples || route?.totalSamples}
              </Typography>
              <Box sx={{
                width: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Divider sx={{ 
                  flex: 1, 
                  width: "100%",
                  border: "none",
                  borderTop: theme => `2px dashed ${theme.palette.grey[400]}` 
                  }} 
                />
                <IoChevronForwardSharp style={{color: grey[400]}} />
              </Box>
              <Typography 
                variant="h6" 
                sx={{
                  textAlign: "center",
                  fontSize: 11,
                }}
              >
                {route?.collection_to_hub_reception || route?.hub_registration_to_lab_reception} dias | 2.6 Km
              </Typography>
          </Box>

          {route?.hubCode &&
            <>
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "70px",
                
              }}>
                <Box sx={{
                  position: "relative", 
                  height: "40px",
                  width: "20px",
                  marginLeft: "30px",
                  margin: 0,
                }}>
                  <AnimatedMapIcon color={palette.secondary.main}/>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  {route?.hubName}
                </Typography>
              </Box>

              <Box sx={{
                  flex: 1, 
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start"
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "bold"
                    }}
                  >
                    {route?.totalSamples}
                  </Typography>
                  <Box sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}>
                    <Divider sx={{ 
                      flex: 1, 
                      width: "100%",
                      border: "none",
                      borderTop: theme => `2px dashed ${theme.palette.grey[400]}` 
                      }} 
                    />
                    <IoChevronForwardSharp style={{color: grey[400]}} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{
                      textAlign: "center",
                      fontSize: 11,
                    }}
                  >
                    {route?.hub_registration_to_lab_reception} dias | 2.6 Km
                  </Typography>
              </Box>
            </>
          }

          <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "70px",
            
          }}>
            <Box sx={{
              position: "relative", 
              height: "40px",
              width: "20px",
              marginLeft: "30px",
              margin: 0,
            }}>
              <AnimatedMapIcon color={palette.primary.main}/>
            </Box>
            <Typography 
              variant="h6" 
              sx={{
                textAlign: "center",
                fontSize: 12,
              }}
            >
              {route?.labName}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}
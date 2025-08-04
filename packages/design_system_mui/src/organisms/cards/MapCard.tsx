import {
  Box, 
  Box as Header,
  Box as Body,
  Typography
} from "@mui/material";
import hexToRgba from "hex-to-rgba";

import {MoleculeMap} from "../../molecules/maps/MoleculeMap";
import { Button } from "../../atoms/inputs/Button";
import { TbArrowNarrowRight } from "react-icons/tb";

import {RoutesProps} from "../../types/facilities";

export type MapCardProps = {
  routes: RoutesProps[];
  redirectPage?: string;
}

export function MapCard ({routes, redirectPage}: MapCardProps)  {

  return (
    <Box sx={{ 
      width: "100%", 
      typography: "body1",
      backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
      borderRadius: "16px",
      boxShadow: 1,
      overflow: "hidden",
      position: "relative",
      height: "400px"
    }}>
        <Header sx={{
          padding: 3,
          paddingLeft: 4,
          paddingRight: 4,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderBottom: "1px dashed rgba(145, 158, 171, 0.24)",
          backdropFilter: "blur(6px)", //@ts-ignore
          backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.6"),
          position: "absolute",
          zIndex: 10,
          top: 0,
          left: 0,
          right: 0,
        }}>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}>
            <Typography variant="h5" sx={{
              color: "text.primary",
              fontWeight: 600,
              fontSize: "1.1em",
              marginBottom: 1
            }}>
              Rotas das Amostras
            </Typography>
            <Typography variant="h5" sx={{
              color: "text.primary",
              fontWeight: 400,
              fontSize: "0.8em"
            }}>
              Este relatorio apresenta o fluxo das amostras desde o local de colheita ao lab de testagem
            </Typography>
          </Box>
          <Button 
            variant="contained"
            sx={{
              color: "white",
            }}
          >
            Ver as Rotas
            <TbArrowNarrowRight fontSize={20}/>
          </Button>
        </Header>
        <Body sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
          borderRadius: "16px",
        }}>
          <MoleculeMap routes={routes} hideZoomControls/>
        </Body>
    </Box>
  );
}
import { useTheme, Box, Typography } from "@mui/material";
import hexToRgba from "hex-to-rgba";

export type Props = {
  name: string;
  onClick: () => void;
  highlighted?: boolean;
  hidden?: boolean;
  zoom?: number;
  color?: string
}

export function Icon({name, onClick, highlighted, hidden, zoom, color="#00B000"}: Props) {
  const {palette} = useTheme();
  const textBorderColor = palette.mode === "light" ? "white" : "#111111";

  return (
    <Box sx={{
      position: "relative"
    }}>
      {(zoom >= 8 || highlighted) ? 
        <Box sx={{
          padding: 1,
          boxShadow: 1,
          borderRadius: 16,
          backgroundColor: highlighted ? "black" : "background.paper",
          zIndex: highlighted ? 10 : 0,
          position: "absolute",
          left: -40,
          border: "0.08px solid rgba(145, 158, 171, 0.24)",
          display: hidden ? 'none' : 'block',
          width: "100px",
          "&:hover": {
            zIndex: 10,
            cursor: "pointer"
          }
          
        }}
        onClick={onClick}
        >
          <Typography 
            sx={{
              fontSize: "10px", 
              fontWeight: "bold", 
              display: "inline",
              color: highlighted ? "white" : "text.primary"
            }}
          >{name}</Typography>
        </Box>
        : 
        <>
          <Box 
            sx={{
              display: "flex",
              flexDir: "row",
              alignItems: "center",
              ":hover": {
                cursor: "pointer",
                zIndex: 10,
                "& .iconLabel": {
                  display: "block"
                }
              }
              
            }}
            onClick={onClick}
          >
            <Box sx={{
              width: 20, 
              height: 20,
              borderRadius: "50%",
              backgroundColor: hexToRgba(color, 0.08),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Box sx={{
                width: "30%", 
                height: "30%",
                borderRadius: "50%",
                backgroundColor: color
              }}/>
            </Box>
            <Typography 
              className="iconLabel"
              sx={{
                fontSize: 10,
                fontWeight: "bold",
                marginLeft: "2px",
                display: "none",
                color: "text.primary",
                textShadow: `-1px 0 ${textBorderColor}, 0 1px ${textBorderColor}, 1px 0 ${textBorderColor}, 0 -1px ${textBorderColor}`
              }}
            >
              {name}
            </Typography>  

          </Box>
        </>
      }
    </Box>
  )
}
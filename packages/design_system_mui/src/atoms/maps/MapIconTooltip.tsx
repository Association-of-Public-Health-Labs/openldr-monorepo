import React from "react";
import Zoom from '@mui/material/Zoom';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import hexToRgba from "hex-to-rgba";

export const MapIconTooltip: React.FC<TooltipProps> = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} TransitionComponent={Zoom} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backdropFilter: "blur(6px)",
    backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.2"),
    color: "white",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(10),
    padding: 10,
    marginTop: "-30px",
    marginRight: 50,
    borderWidth: "none",
    borderRadius: "12px",
    boxShadow: "rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 22%) 0px 12px 24px -4px"
  },
}));
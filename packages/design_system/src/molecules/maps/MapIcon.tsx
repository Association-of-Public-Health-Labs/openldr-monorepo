import React, { Fragment } from "react";
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

import {MapIconTooltip} from "../../atoms/maps/MapIconTooltip";
import {AnimatedMapIcon as Icon} from "../../atoms/maps/AnimatedMapIcon";

export type Props = {
  label?: string;
  color?: string;
  close?: boolean;
  pulse?: boolean;
  onClick?: () => void
}

export function MapIcon({ label, color, close, pulse, onClick }: Props) {
  const [open, setOpen] = React.useState(false);
  const {palette} = useTheme();
  const textBorderColor = palette.mode === "light" ? "white" : "#111111";
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
      <MapIconTooltip
        placement="top"
        title={
          <React.Fragment>
            <Typography color="inherit">{label}</Typography>
          </React.Fragment>
        }
      > 
        <Box sx={{
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            position: "relative"
          }}
        >
          <Icon 
            color={color} 
            pulse={pulse}
            close={close}
            onClick={onClick}
          />
          <Typography 
            fontSize={10} 
            sx={{
              fontWeight: "bold", 
              color: "green", 
              position: "absolute",
              left: '-45%', 
              top: 8,
              textAlign: "center",
              textShadow: `-1px 0 ${textBorderColor}, 0 1px ${textBorderColor}, 1px 0 ${textBorderColor}, 0 -1px ${textBorderColor}`
            }}
          >
            {label}
          </Typography>
        </Box>
      </MapIconTooltip>
  );
}

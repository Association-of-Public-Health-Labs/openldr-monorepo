import React, {ReactNode} from "react";
import {Button as MuiButton} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import hexToRgba from "hex-to-rgba";

export interface SideBarMenuMobileButtonProps {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  icon?: ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
}

export function SideBarMenuMobileButton({
    color="primary",  
    icon, 
    label, 
    active,
    href="#"
}: SideBarMenuMobileButtonProps) {
  const theme = useTheme(); 
  const themeColor = theme.palette[color]?.main;
  const textColor = theme.palette["text"]?.secondary;
  
  return (
      <MuiButton 
        aria-label="fingerprint" 
        color={color} 
        href={href} 
        style={{
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "8px",
          paddingTop: 4,
          color: textColor,
          ...(active && {
            backgroundColor: hexToRgba(themeColor, 0.08),
            color: themeColor
          }),
        }}
      >
        { icon }
        {label && 
          <span 
            style={{
              fontSize: 12, 
              ...(active && {
                color: themeColor,
                fontWeight: "bold",
              })
            }}
          >
            {label}
          </span>
        }
      </MuiButton>
  );
}

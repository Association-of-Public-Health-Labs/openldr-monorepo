import React, {ReactNode} from "react";
import {Button as MuiButton} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {IoGridOutline} from "react-icons/io5";
import hexToRgba from "hex-to-rgba";

export interface SideBarMenuButtonProps {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  variant: "row" | "column";
  icon?: ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
  width?: string | number;
}

export function SideBarMenuButton({
    color="primary", 
    variant="column", 
    icon, 
    label, 
    active,
    href="#",
    width
}: SideBarMenuButtonProps) {
  const theme = useTheme(); // @ts-ignore
  const themeColor = theme.palette[color]?.main;
  const textColor = theme.palette["text"]?.secondary;
  
  return (
      <MuiButton 
        aria-label="fingerprint" 
        color={color} 
        href={href} 
        style={{
          ...((variant === "column") ? {
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 8,
            paddingRight: 8,
            width: width || "100px",
          }: 
          {
            borderRadius: 8,
            display: "flex",
            flexDirection: "row",
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            width: width || "200px",
            gap: "24px",
            justifyContent: "flex-start",
            alignItems: "center",
          }),
          color: textColor,
          ...(active && {
            backgroundColor: hexToRgba(themeColor, 0.08),
            color: themeColor
          }),
        }}
      >
        { icon || 
          <IoGridOutline 
            size={20} 
            style={{
              ...(active && {
                color: themeColor,
              })
            }} 
          /> 
        }
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

import React, {ReactNode, ComponentType} from "react";
import {Button as MuiButton, SxProps, Theme, Tooltip} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {IoGridOutline} from "react-icons/io5";
import hexToRgba from "hex-to-rgba";

export interface SideBarMenuButtonProps {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  variant: "row" | "column";
  icon?: ReactNode | ComponentType<{ size?: number; color?: string, style?: "outline" | "two-tone" }>;
  label?: string;
  active?: boolean;
  href?: string;
  width?: string | number;
  sx?: SxProps<Theme>
  navigationColor?: "integrate" | "apparent"
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  hideLabel?: boolean;
  tooltip?: string;
  endIcon?: ReactNode;
}

export function SideBarMenuButton({
    color="primary", 
    variant="column", 
    icon: IconComponent, 
    label, 
    active,
    href="#",
    width,
    sx,
    navigationColor="integrate",
    onClick,
    hideLabel=false,
    tooltip,
    endIcon
}: SideBarMenuButtonProps) {
  const theme = useTheme(); // @ts-ignore
  const themeColor = theme.palette[color]?.main;
  const textColor = theme.palette["text"]?.secondary;
  
  const button = (
      <MuiButton 
        aria-label="fingerprint" 
        color={color} 
        href={href}
        onClick={onClick}
        style={{
          ...((variant === "column") ? {
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingTop: 10,
            paddingBottom: 10,
            // paddingLeft: 8,
            // paddingRight: 8,
            width: width || "100%",
          }: 
          {
            borderRadius: 8,
            display: "flex",
            flexDirection: "row",
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            width: width || "100%",
            gap: "12px",
            justifyContent: "flex-start",
            alignItems: "center",
          }),
          color: textColor,
          ...(active && {
            backgroundColor: hexToRgba(themeColor, 0.08),
            color: themeColor
          })
        }}
        sx={{
          ...sx,
          "&:hover": {
            backgroundColor: getHoverBackgroundColor(navigationColor, active as boolean, variant, theme)
          }
        }}
      >
        {typeof IconComponent === 'function' ? (
          <IconComponent 
            size={16} 
            color={active ? themeColor : undefined}
            // style={active ? "two-tone" : "outline"}
            style="two-tone"
          />
        ) : (
          IconComponent || <IoGridOutline 
            size={16} 
            style={{
              ...(active && {
                color: themeColor,
              })
            }} 
          />
        )}
        {label && 
          <span 
            style={{
              display: hideLabel ? "none" : "inline",
              fontSize: 10, 
              fontWeight: "bold",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              ...(active && {
                color: themeColor,
              })
            }}
          >
            {label}
          </span>
        }
        {endIcon && !hideLabel && (
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
            {endIcon}
          </span>
        )}
      </MuiButton>
  );

  if (tooltip && hideLabel) {
    return (
      <Tooltip title={tooltip} placement="right">
        {button}
      </Tooltip>
    );
  }

  return button;
}

const getHoverBackgroundColor = (
  navigationColor: 'integrate' | 'apparent',
  active: boolean,
  variant: 'column' | 'row',
  theme: Theme
) => {
  if (active) return 'none';

  switch (navigationColor) {
    case 'integrate':
      return theme.palette.background.default;
    case 'apparent':
      return variant === 'column' 
        ? hexToRgba(theme.palette.background.paper, 0.8)
        : hexToRgba(
          theme.palette.background.paper, 
          theme?.palette?.mode === "light" ? 0.06 : 0.8);
    default:
      return 'none';
  }
};

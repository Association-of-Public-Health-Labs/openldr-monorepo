import React, {useState} from "react";
import {Box, BoxProps} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import {IoEllipsisHorizontalSharp, IoChevronForward, IoChevronBack} from "react-icons/io5";

import {MainOptions, OptionsProps} from "../../molecules/sidebar/MainOptions";
import { Menu } from "../../atoms/navigation/Menu";
import {Logo} from "../../atoms/images/Logo";
import { Stack, Typography } from "@mui/material";
import { SettingsProps } from "../../types/global";

export interface Props {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  settings: SettingsProps
  handleSetAppSettings: (settings: SettingsProps) => void
  options: OptionsProps[],
  appName: string,
  containerProps?: BoxProps
}

const menuOptions = [
  "None",
  "Atria",
  "Callisto",
];

export function MainSidebar ({color, settings, handleSetAppSettings, options, appName, containerProps}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarVariant, setSidebarVariant] = useState<"column" | "row">(settings?.sidebar);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeSidebarSize = () => {
    setSidebarVariant(sidebarVariant === "column" ? "row" : "column");
    handleSetAppSettings({...settings, sidebar: sidebarVariant === "column" ? "row" : "column"})
  }

  return (
    <Box
      className="first-step"
      sx={{
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 1,
        paddingRight: 1,
        ...containerProps
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Logo size="small" />
          <Stack sx={{display: `${settings?.sidebar === "column" ? "none" : "block" }`}}>
            <Typography color="text.primary">MISAU</Typography>
            <Typography color="text.secondary" fontSize={12}>{appName}</Typography>
          </Stack>
        </Box>
        <IconButton
          aria-label="more"
          id="long-button"
          size="small"
          sx={{
            backgroundColor: "background.default",
          }}
          onClick={handleChangeSidebarSize}
        >
          {settings?.sidebar === "row" ? <IoChevronBack /> : <IoChevronForward />}
        </IconButton>
      </Box>
      <MainOptions 
        color={color}
        variant={settings?.sidebar}
        options={options}
      />
      <Box>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
          sx={{display: "none"}}
        >
          <IoEllipsisHorizontalSharp />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              width: "20ch",
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          {menuOptions?.map((option) => (
            <MenuItem 
              key={option} 
              sx={{
                borderRadius: 2,
                padding: 1,
              }}
              selected={option === "Pyxis"} 
              onClick={handleClose}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  )
}
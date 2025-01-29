import React, {useState} from "react";
import {Box, Box as Header, IconButton, MenuItem, Typography} from "@mui/material";
import hexToRgba from "hex-to-rgba";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";

import { Menu } from "../../atoms/navigation/Menu";

export type Options = {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

export type Props = {
  options?: Options[];
  additionalOptions?: Options[];
}

export function MapHeader ({options, additionalOptions}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Header sx={{
      position: "absolute",
      right: 10,
      top: 10,
      zIndex: 99,
      backdropFilter: "blur(6px)",
      backgroundColor: theme => hexToRgba(theme.palette.background.paper, "0.8"),
      borderRadius: "12px",
      boxShadow: 2,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: 2,
      paddingTop: 1,
      paddingBottom: 1,
    }}>
        {
          options?.map((option, index) => (
            <IconButton 
              key={index} 
              aria-label={option?.label || "icone"} 
              size="large"
              onClick={() => option?.action && option.action()}
            >
              {option?.icon}
            </IconButton>
          ))
        }
        {additionalOptions && (
          <Box sx={{marginLeft: 1}}> 
            <IconButton  
              size="large"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <IoEllipsisHorizontalSharp size={20}/>
            </IconButton>
            <Menu 
              id="options-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              sx={{
                marginTop: 5,
              }}
            >
              {additionalOptions?.map((option, index) => (
                <MenuItem 
                  key={index}
                  onClick={() => {
                    option?.action && option.action();
                    handleClose
                  }}
                  sx={{
                    borderRadius: 2,
                    padding: 1,
                  }}
                >
                  {option?.icon}
                  <Typography sx={{marginLeft: 2}}>{option?.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
    </Header>
  )
}
import React, {FC, ReactNode} from "react";
import {Menu as MUIMenu, MenuProps} from "@mui/material";

export type MenuOptionProps = {
  label: string;
  icon?: ReactNode;
  action?: () => void;
}

export const Menu: FC<MenuProps> = (props) => {

  return (
    <MUIMenu
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
      sx={{
        ...props.sx,
        "& .MuiMenu-paper": {
          borderRadius: 4,
          boxShadow: 1,
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "divider",
        },
      }}
      
    >
      {props?.children}
    </MUIMenu>
  )
}
import React, {useState} from "react";
import {
  Avatar as MuiAvatar, 
  MenuItem, 
  Box, 
  Typography,
  Divider
} from "@mui/material";
import { Menu } from "../../atoms/navigation/Menu";

export type UserNavigationProps = {
  name: string;
  email: string;
  avatar?: string;
}

export type UserProps = {
  user: UserNavigationProps
}

export function UserNavigation ({user}: UserProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MuiAvatar 
        sx={{ 
          bgcolor: "purple", 
          color: "white",
          width: 30,
          height: 30,
        }}
        onClick={handleClick}
        src={user?.avatar}
      >
        {user?.name[0]}
      </MuiAvatar>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            boxShadow: "rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px;",
            filter: 'drop-shadow(rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px)',
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          padding: 0
        }}
      >
        <Box sx={{
          padding: 1,
          paddingLeft: 3, 
          paddingRight: 3
        }}>
          <Typography sx={{fontWeight: "bold"}}>{user?.name}</Typography>
          <Typography>{user?.email}</Typography>
        </Box>
        <Divider sx={{ 
            my: 0.5, 
            marginBottom: 1, 
            border: "none",
            borderTop: "1px dashed rgba(145, 158, 171, 0.24)" 
          }} 
        />
        <Box sx={{paddingLeft: 1, paddingRight: 1}}>
            <MenuItem 
              key={1} 
              sx={{
                borderRadius: 2,
                padding: 1,
                paddingLeft: 2, 
                paddingRight: 2
              }}
              // selected={option === "Pyxis"} 
              onClick={handleClose}
            >
              Conta de Perfil
            </MenuItem>
            <MenuItem 
              key={2} 
              sx={{
                borderRadius: 2,
                padding: 1,
                paddingLeft: 2, 
                paddingRight: 2
              }}
              // selected={option === "Pyxis"} 
              onClick={handleClose}
            >
              Configurações
            </MenuItem>
        </Box>
        <Divider sx={{ 
          my: 0.5, 
          marginTop: 1, 
          marginBottom: 1, 
          border: "none",
          borderTop: "1px dashed rgba(145, 158, 171, 0.24)" 
          }} 
        />
        <Box sx={{paddingLeft: 1, paddingRight: 1}}>
          <MenuItem 
            sx={{
              borderRadius: 2,
              padding: 1,
              paddingLeft: 2, 
              paddingRight: 2
            }}
            onClick={handleClose}
          >
            Sair da conta
          </MenuItem>
        </Box>
      </Menu>
    </>
  )
}
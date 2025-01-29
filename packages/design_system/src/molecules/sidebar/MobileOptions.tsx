import React, {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import {SideBarMenuMobileButton} from "../../atoms/inputs/SideBarMenuMobileButton";

export interface MobileOptionsProps {
  icon?: ReactNode;
  label?: string;
  active?: boolean;
}

export interface Props {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  options: MobileOptionsProps[]
}

export function MobileOptions({color, options}: Props) {
  return (
    <Box sx={{ 
      width: "100%",
      padding: 1
    }}>
      <Stack spacing={1} direction="row">
        {
          Array.isArray(options) && options?.map((option, index) => (
            <SideBarMenuMobileButton
              key={index}
              color={color}
              icon={option.icon}
              label={option.label}
              active={option?.active || false}
            />
          ))
        }
      </Stack>
    </Box>
  );
}

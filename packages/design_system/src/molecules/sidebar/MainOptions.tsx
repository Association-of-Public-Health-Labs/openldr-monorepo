import React, {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import {SideBarMenuButton} from "../../atoms/inputs/SideBarMenuButton";

export interface OptionsProps {
  icon?: ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
}

export interface Props {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  variant: "row" | "column";
  options: OptionsProps[];
  stacked?: boolean;
}

export function MainOptions({color, variant, options, stacked=true}: Props) {
  if(stacked) {
    return (
      <Box 
        className=""
        sx={{ width: "100%" }}
      >
        <Stack spacing={1}>
          {
            Array.isArray(options) && options?.map((option, index) => (
              <SideBarMenuButton
                key={index}
                color={color}
                variant={variant}
                icon={option.icon}
                label={option.label}
                active={option?.active || false}
                href={option?.href}
              />
            ))
          }
        </Stack>
      </Box>
    );
  }

  return (
    <Box 
        className=""
        sx={{ width: "100%" }}
    >
      <Stack direction="row" spacing={1}>
        {
          Array.isArray(options) && options?.map((option, index) => (
            <SideBarMenuButton
              key={index}
              color={color}
              variant="row"
              icon={option.icon}
              label={option.label}
              active={option?.active || false}
              href={option?.href}
              width={"auto"}
            />
          ))
        }
      </Stack>
    </Box>
  )
}

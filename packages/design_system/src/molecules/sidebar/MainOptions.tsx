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
  options: OptionsProps[]
}

export const SidebarMainOptionsStep = {
  selector: "sidebar-main-options",
  content: "Este é o menú principal de navegação da Dashboard. Ele contempla 3 opções a partir das quais poderás navegar entre as páginas da aplicação. A opção “Sumário” corresponde a página do Resumo geral, a opção “Lab” corresponde a página dos Laboratórios e por fim a opção “Provincia” apresenta os dados por Provincia/Distrito/Unidade Sanitária"
}

export function MainOptions({color, variant, options}: Props) {
  return (
    <Box 
      className={SidebarMainOptionsStep.selector}
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

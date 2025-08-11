import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { IoArrowForward } from "react-icons/io5";

export type BreadcrumbProps = {
  links: {
    label: string;
    href: string;
    onClick?: () => void;
  }[];
}


export function Breadcrumb({links}: BreadcrumbProps) {

  const breadcrumbs = links.map((link, index) => {
    if(index === links.length - 1) {
      return (
        <Typography variant="subtitle2" key={index} sx={{ color: 'text.primary' }}>
          {link.label}
        </Typography>
      )
    }
    return (
      <Link 
        underline="hover" 
        key={index} 
        variant='subtitle2'
        color="inherit" 
        href={link.href} 
        onClick={(event) => {
          event.preventDefault();
          if(link?.onClick) {
            link.onClick();
          }
        }}
      >
        {link.label}
      </Link>
    )
  });

  return (
    <Stack spacing={2}>
      <Breadcrumbs
        separator={<IoArrowForward fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
}

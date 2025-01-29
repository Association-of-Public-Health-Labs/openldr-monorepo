import React from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// import { useTheme } from '@emotion/react';

export default {
  title: 'Test/ThemeTest',
};

export const RedButton = () => {
  const theme = useTheme();
  return (
    <>
      <Button color="primary" variant="contained">I should be red!</Button>
      <Typography>Hello World... {theme.palette.mode}</Typography> 
      <Typography sx={{ color: theme.palette.text.secondary }}>Hello World...</Typography>
    </>
  )
}
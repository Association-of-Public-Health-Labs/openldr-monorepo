"use client";

import { ReactNode } from "react";
import MuiButton from '@mui/material/Button';

export interface ButtonProps {
  children: ReactNode;
  className?: string;
}


export const TestButton = ({ children, className }: ButtonProps) => {
    return <MuiButton variant="contained">{children}</MuiButton>;
};

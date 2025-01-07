import React from 'react';
import Button from '@mui/material/Button';

export const MyButton = ({ label }: { label: string }) => {
    return <Button variant="contained">{label}</Button>;
};

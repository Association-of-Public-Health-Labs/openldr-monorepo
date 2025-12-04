import React from 'react';
// import {
//     Dialog,
//     DialogContent,
//     DialogActions,
//     Button,
//     CircularProgress,
//     Typography,
//     Paper,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Box,
// } from '@repo/design_system_mui';
// import { DialogTitle } from '@mui/material';

import { Dialog } from '@repo/design_system_mui';

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';

interface PatientDialogProps {
    open: boolean;
    onClose: () => void;
    facilityName?: string;
    data: any[];
    loading: boolean;
    error: string | null;
}

export const PatientDialog: React.FC<PatientDialogProps> = ({
    open,
    onClose,
    facilityName,
    data,
    loading,
    error,
}) => {
    const title = facilityName ? `Pacientes - ${facilityName}` : 'Detalhes dos Pacientes';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            aria-labelledby="patient-dialog-title"
        >
            <DialogTitle id="patient-dialog-title">
                {title}
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="body1">
                        {error}
                    </Typography>
                ) : data.length === 0 ? (
                    <Typography variant="body1">Nenhum dado de paciente disponível.</Typography>
                ) : (
                    <TableContainer component={Paper}>
                        <Table size="small" aria-label="Tabela de pacientes">
                            <TableHead>
                                <TableRow>
                                    {Object.keys(data[0] || {}).map((key) => (
                                        <TableCell key={key}>
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => (
                                    <TableRow key={index}>
                                        {Object.values(row).map((value: any, i) => (
                                            <TableCell key={i}>
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PatientDialog;

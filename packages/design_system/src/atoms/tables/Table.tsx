import {Table as MuiTable} from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import hexToRgba from "hex-to-rgba";
import { useTheme } from "@mui/material/styles";

export interface Props {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  columns?: string[];
  rows?: object[];
  dense?: boolean;
}

export function SimpleTable({ color, columns=[], rows=[], dense }: Props) {
  const theme = useTheme(); // @ts-ignore
  const themeColor = theme.palette[color]?.main || "primary";

  return (
    <TableContainer component={Paper} style={{
        boxShadow: "none",
        borderColor: themeColor,
        borderTopWidth: 1,
        borderRadius: 0
      }}
    >
      <MuiTable 
        size={dense ? "small" : "medium"} 
        sx={{
          minWidth: 650, 
          boxShadow: "none",
          "th.MuiTableCell-root.MuiTableCell-head": {
            borderColor: themeColor,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            color: themeColor,
          },
          "table": {
            boxShadow: "none",
            borderColor: themeColor,
            borderTopWidth: 1,
          },
          "thead tr": {
            borderColor: themeColor,
            borderTopWidth: 1,
          }
        }} 
        aria-label="simple table"
      >
        <TableHead style={{
          borderColor: themeColor,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          backgroundColor: hexToRgba(themeColor, 0.1),
          borderRadius: 0
        }}>
          <TableRow
            sx={{ 'th.MuiTableCell-head': { borderTop: 0.5 } }}
          >
            {
              Array.isArray(columns) && columns?.map((value, index) => (
                index === 0 ? 
                  <TableCell>{value}</TableCell>
                : 
                  <TableCell align="center">{value}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(rows) && rows?.map((row, index) => (
            <TableRow
              key={index}
              // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {
                Object.values(row).map((value, index) => (
                  index === 0 ? 
                    <TableCell component="th" scope="row">
                      {value}
                    </TableCell>
                  :
                    <TableCell align="center">{value}</TableCell>
                ))
              }
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}
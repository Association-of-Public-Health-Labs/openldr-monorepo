import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Box, Paper, useTheme } from "@mui/material";
import hexToRgba from "hex-to-rgba";

export type HighlightsTableProps = {
  columns?: string[];
  rows?: object[];
  dense?: boolean;
  highlightedRow?: number;
  highlightedColumn?: number;
  highlightColor?: string;
};

export function HighlightsTable({ 
  columns = [], 
  rows = [], 
  dense = false, 
  highlightedRow, 
  highlightedColumn,
  highlightColor
}: HighlightsTableProps) {
  const theme = useTheme();
  
  // Use provided highlight color or default to theme primary color
  const defaultHighlightColor = theme.palette.primary.main;
  const finalHighlightColor = highlightColor || defaultHighlightColor;

  const getColumnWidth = (index: number) => {
    // Dynamic width calculation based on number of columns
    const columnCount = columns.length;
    const widthPercentage = 100 / columnCount;
    return `${widthPercentage}%`;
  };

  const getColumnData = (row: any, columnIndex: number) => {
    const columnKey = columns[columnIndex].toLowerCase();
    return row[columnKey] || row[Object.keys(row)[columnIndex]] || "";
  };

  const getCellAlignment = (columnIndex: number) => {
    // First column left-aligned, other columns centered
    return columnIndex === 0 ? "left" : "center";
  };

  const getColumnPosition = (columnIndex: number) => {
    // Calculate position for background cards based on column index
    const columnCount = columns.length;
    const widthPercentage = 100 / columnCount;
    return `${columnIndex * widthPercentage}%`;
  };

  const getColumnWidthPercentage = () => {
    const columnCount = columns.length;
    return 100 / columnCount;
  };

  // Check if last column is highlighted
  const isLastColumnHighlighted = highlightedColumn === columns.length - 1;

  return (
    <Box sx={{ position: "relative", overflow: "visible", width: "100%" }}>
      {/* Fake background cards */}
      {columns.map((_, columnIndex) => (
        <Box
          key={`background-${columnIndex}`}
          sx={{
            position: "absolute",
            top: "-16px",
            bottom: "-16px",
            left: getColumnPosition(columnIndex),
            width: `${getColumnWidthPercentage()}%`,
            backgroundColor: highlightedColumn === columnIndex 
              ? hexToRgba(finalHighlightColor, 0.1) 
              : "transparent",
            border: highlightedColumn === columnIndex
              ? `2px solid ${finalHighlightColor}` 
              : "none",
            borderRadius: theme.shape.borderRadius * 2, // 8px based on theme
            zIndex: 0,
            transition: "all 0.3s ease",
            // When last column is highlighted, adjust the card width to not cover the invisible column
            ...(isLastColumnHighlighted && columnIndex === columns.length - 1 && {
              width: `calc(${getColumnWidthPercentage()}% - 20px)`,
            }),
          }}
        />
      ))}

      {/* Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          position: "relative",
          zIndex: 1,
          backgroundColor: "transparent !important",
          boxShadow: "none",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius, // 8px based on theme
          overflow: "visible",
          "& .MuiPaper-root": {
            backgroundColor: "transparent !important",
          },
        }}
      >
        <Table 
          size={dense ? "small" : "medium"}
          sx={{
            tableLayout: "fixed",
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <TableHead>
            <TableRow sx={{ borderBottom: `1px solid ${theme.palette.divider}`, }}>
              {columns.map((column, index) => (
                <TableCell
                  key={column}
                  sx={{
                    // backgroundColor: "transparent",
                    border: "none",
                    fontWeight: 700,
                    color: highlightedColumn === index 
                      ? finalHighlightColor 
                      : theme.palette.text.primary,
                    width: getColumnWidth(index),
                    padding: dense ? "8px 16px" : "16px",
                    textAlign: getCellAlignment(index),
                    transition: "color 0.3s ease",
                    fontFamily: theme.typography.fontFamily,
                    backgroundColor: theme.palette.background.default
                  }}
                >
                  {column}
                </TableCell>
              ))}
              {/* Invisible column when last column is highlighted */}
              {isLastColumnHighlighted && (
                <TableCell
                  sx={{
                    backgroundColor: "transparent",
                    border: "none",
                    width: "20px",
                    padding: 0,
                    minWidth: "20px",
                    maxWidth: "20px",
                  }}
                />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  backgroundColor: "transparent",
                  "&:last-child": {
                    borderBottom: "none",
                  },
                  "&:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                {columns.map((_, columnIndex) => (
                  <TableCell
                    key={`${rowIndex}-${columnIndex}`}
                    sx={{
                      backgroundColor: "transparent",
                      border: "none",
                      width: getColumnWidth(columnIndex),
                      padding: dense ? "8px 16px" : "16px",
                      color: highlightedColumn === columnIndex 
                        ? finalHighlightColor 
                        : theme.palette.text.primary,
                      wordWrap: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: getCellAlignment(columnIndex),
                      transition: "color 0.3s ease",
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    {getColumnData(row, columnIndex)}
                  </TableCell>
                ))}
                {/* Invisible cell when last column is highlighted */}
                {isLastColumnHighlighted && (
                  <TableCell
                    sx={{
                      backgroundColor: "transparent",
                      border: "none",
                      width: "20px",
                      padding: 0,
                      minWidth: "20px",
                      maxWidth: "20px",
                    }}
                  />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
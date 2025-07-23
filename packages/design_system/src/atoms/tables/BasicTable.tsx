
import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import hexToRgba from "hex-to-rgba";

export type Props = {
  columns?: string[];
  rows?: object[];
  dense?: boolean;
  highlightedRow?: number;
};

export function BasicTable({ columns, rows, dense, highlightedRow }: Props) {
  return (
    <TableContainer
      sx={{
        boxShadow: "none",
        backgroundColor: "transparent",
        "& .MuiPaper-root": {
          boxShadow: "none",
        },
      }}
    >
      <Table
        // Previously className={classes.table}
        // size={dense ? "small" : "medium"}
        size="small"
        sx={{
          minWidth: 400,
          backgroundColor: "transparent",
        }}
        aria-label="simple table"
      >
        <TableHead
          // Previously classes={{ root: classes.thead }}
          sx={(theme) => ({
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.background.default,

            // Equiv. to thead: "& th:first-child" => borderRadius
            "& th:first-of-type": {
              borderRadius: "10px 0 0 10px",
            },
            "& th:last-of-type": {
              borderRadius: "0 10px 10px 0",
            },
          })}
        >
          <TableRow>
            {Array.isArray(columns) &&
              columns.map((value, index) =>
                index === 0 ? (
                  <TableCell
                    key={index}
                    // Previously className={classes.sticky}
                    sx={{
                      position: "sticky",
                      left: 0,
                      border: "none",
                      paddingY: "0.6rem",
                      fontWeight: "bold",
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? theme.palette.background.paper
                          : theme.palette.background.default,
                    }}
                  >
                    {value}
                  </TableCell>
                ) : (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{ border: "none", paddingY: "0.6rem", fontWeight: "bold" }}
                  >
                    {value}
                  </TableCell>
                )
              )}
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.isArray(rows) &&
            rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                // Previously className={classes.tcell}
                sx={(theme) => ({
                  "& th": {
                    background: "transparent",
                  },
                  "&:last-child td, &:last-child th": {
                    borderBottom: 0,
                  },
                  "& td": {
                    paddingY: "0.7rem",
                  },

                  // Hover highlight
                  "&:hover td": {
                    backgroundColor: hexToRgba(
                      theme.palette.background.default,
                      "0.8"
                    ),
                  },
                  "&:hover th": {
                    backgroundColor: hexToRgba(
                      theme.palette.background.default,
                      "0.8"
                    ),
                  },
                  // Highlighted row styling
                  ...(rowIndex === highlightedRow && {
                    "& th, & td": {
                      backgroundColor: `${hexToRgba(
                        theme.palette.primary.main,
                        "0.05"
                      )} !important`,
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                    },
                  }),
                })}
              >
                {Object.values(row).map((value, colIndex) =>
                  colIndex === 0 ? (
                    <TableCell
                      key={colIndex}
                      component="th"
                      scope="row"
                      // Previously className={classes.sticky}
                      sx={(theme) => ({
                        position: "sticky",
                        left: 0,
                        border: "none",
                        fontWeight: 500,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.background.default
                            : theme.palette.background.paper,
                        "&:hover": {
                          backgroundColor: hexToRgba(
                            theme.palette.mode === "dark"
                              ? theme.palette.background.paper
                              : theme.palette.background.default,
                            "0.8"
                          ),
                        },
                      })}
                    >
                      {value}
                    </TableCell>
                  ) : (
                    <TableCell
                      key={colIndex}
                      align="center"
                      sx={{
                        border: "none",
                      }}
                    >
                      {value}
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

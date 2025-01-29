import { makeStyles } from "@mui/material";
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
}

const useStyles = makeStyles((theme) => ({
  table: {
    minWidth: 400,
    backgroundColor: "transparent"
  },
  thead: {
    "& th:first-child": {
      borderRadius: "16px 0 0 16px"
    },
    "& th:last-child": {
      borderRadius: "0 16px 16px 0"
    },
  },
  tcell: {
    "&: th": {
      background: "transparent"
    },
    "&:last-child td": {
      borderBottom: 0,
    },
    "&:last-child th": {
      borderBottom: 0,
    },
  },
  sticky: {
    position: "sticky",
    left: 0,
  }
}));

export function BasicTable({columns, rows, dense, highlightedRow}: Props) {
  const classes = useStyles();

  return (
    <TableContainer 
      // component={<Scrollbar/>}
      sx={{
        boxShadow: 0,
        backgroundColor: "transparent",
        "& .MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation1.MuiTableContainer-root": {
          boxShadow: 0,
        }
      }}
    >
      <Table 
        className={classes.table} 
        size={dense ? "small" : "medium"} 
        sx={{ 
          minWidth: 650,
          backgroundColor: "transparent",
        }} 
        aria-label="simple table"
      >
        <TableHead 
          classes={{ root: classes.thead }}
          sx={{
            // backgroundColor: theme => theme.palette.background.default
            backgroundColor: theme => theme.palette.mode === "dark" ? "background.paper" : "background.default",
          }}
        >
          <TableRow>
            {
              Array.isArray(columns) && columns?.map((value, index) => (
                index === 0 ? 
                  <TableCell 
                    key={index}
                    className={classes.sticky} 
                    sx={{
                      border: "none",
                      backgroundColor: theme => theme.palette.mode === "dark" ? "background.paper" : "background.default",
                    }}
                  >
                    {value}
                  </TableCell>
                : 
                  <TableCell key={index} sx={{border: "none"}} align="center">{value}</TableCell>
              ))
            }
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(rows) && rows?.map((row, index) => (
            <TableRow
              key={index}
              className={classes.tcell}
              sx={{
                "&:hover td": {
                  backgroundColor: theme => hexToRgba(theme.palette.background.default,"0.8")
                },
                "&:hover th": {
                  backgroundColor: theme => hexToRgba(theme.palette.background.default,"0.8")
                },
                ...(index === highlightedRow) && ({"& th, td": {
                  backgroundColor: theme => hexToRgba(theme.palette.primary.main,"0.05") + " !important",
                  color: "primary.main",
                  fontWeight: "bold"
                }})
              }}
            >
              {
                Object.values(row).map((value, index) => (
                  index === 0 ? 
                    <TableCell 
                      className={classes.sticky}
                      component="th" 
                      scope="row" 
                      key={index}
                      sx={{
                        // border: dense && "none",
                        border: "none",
                        fontWeight: "500",
                        // backgroundColor: theme => theme.palette.background.paper,
                        backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
                        "&:hover": {
                          backgroundColor: theme => hexToRgba(
                            theme.palette.mode === "dark" ? theme.palette.background.paper : theme.palette.background.default,
                            "0.8"
                          )
                        }
                      }}
                    >
                      {value}
                    </TableCell>
                  :
                    <TableCell 
                      align="center"
                      key={index}
                      sx={{
                        // border: dense && "none"
                        border: "none",
                      }}
                    >
                      {value}
                    </TableCell>
                ))
              }
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

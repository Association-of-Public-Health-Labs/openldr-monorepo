import React, {useState, SyntheticEvent} from "react";
import {Box, Typography} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { AdvancedTable, HeadCell, Data as RowProps } from "../../atoms/tables/AdvancedTable";

export type Props = {
  columns: HeadCell[];
  rows: RowProps[];
}

export function TableCard({rows, columns}: Props) {
  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const conventional = rows?.filter(row => row?.labType === "conventional");
  const poc = rows?.filter(row => row?.labType === "poc");

  return (
    <Box sx={{ 
      width: "100%", 
      typography: "body1",
      backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
      borderRadius: "16px",
      boxShadow: 1,
      overflow: "hidden"
    }}>
      <Box sx={{
        padding: 3,
        paddingLeft: 4,
        paddingRight: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}>
          <Typography variant="h5" sx={{
            color: "text.primary",
            fontWeight: 600,
            fontSize: "1.1em"
          }}>
            Amostras por Unidade Sanitaria
          </Typography>
        </Box>
      </Box>
      <TabContext value={value}>
        <Box 
          sx={{ 
            borderBottomColor: "divider",
            borderBottomWidth: "1px",
            borderBottomStyle: "dashed",
            paddingLeft: 4,
          }}
        >
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Todas" value="1" />
            <Tab label="Convencional" value="2" />
            <Tab label="POC" value="3" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <AdvancedTable rows={rows} columns={columns}/>
        </TabPanel>
        <TabPanel value="2">
          <AdvancedTable rows={conventional} columns={columns}/>
        </TabPanel>
        <TabPanel value="3">
          <AdvancedTable rows={poc} columns={columns}/>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
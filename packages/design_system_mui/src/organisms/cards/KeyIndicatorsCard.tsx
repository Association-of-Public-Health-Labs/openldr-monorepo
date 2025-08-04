import {useState, SyntheticEvent} from "react";
import { Box, BoxProps } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { BasicTable } from "../../atoms/tables/BasicTable";

export type KeyIndicatorsCardTableProps = {
  Year: (string | number)[];
  Month: (string | number)[];
  MonthName: string[];
  Registados: (string | number)[];
  Testados: (string | number)[];
  Rejeitados: (string | number)[];
  Pendentes: (string | number)[];
}

export type KeyIndicatorsCardProps = {
  tab1: object[];
  tab2: object[];
  tab3: object[];
  columns: string[];
  containerProps?: BoxProps;
  labels?: string[];
  onValueChange?: (value: string) => void;
}

export function KeyIndicatorsCard({tab1, tab2, tab3, columns, containerProps, labels, onValueChange}: KeyIndicatorsCardProps) {
  const [value, setValue] = useState(labels?.[0]);

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <Box 
      {...containerProps}
      sx={{ 
        width: "100%", 
        typography: "body1",
        backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
        borderRadius: "16px",
        overflow: "hidden",
        ...containerProps?.sx
      }}
      
    >
      <TabContext value={value}>
        <Box 
          sx={{ 
            borderBottomColor: "divider",
            borderBottomWidth: "1px",
            borderBottomStyle: "dashed",
            paddingLeft: 4,
          }}
        >
          <TabList onChange={handleChange}>
            {labels?.map((label, index) => (
              <Tab 
                key={index} 
                label={label} 
                value={label} 
                sx={{ fontWeight: "bold"}} 
              />
            ))}
          </TabList>
        </Box>
        <TabPanel value={labels?.[0]}>
          <BasicTable rows={tab1} columns={columns}/>
        </TabPanel>
        <TabPanel value={labels?.[1]}>
          <BasicTable rows={tab2} columns={columns}/>
        </TabPanel>
        <TabPanel value={labels?.[2]}>
          <BasicTable rows={tab3} columns={columns}/>
        </TabPanel>
      </TabContext>
    </Box>
  );
}

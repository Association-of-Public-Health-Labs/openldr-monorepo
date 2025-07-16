import {useState, SyntheticEvent} from "react";
import { Box, BoxProps } from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import {groupBy} from "lodash";

import { BasicTable } from "../../atoms/tables/BasicTable";

export type TableProps = {
  Year: (string | number)[];
  Month: (string | number)[];
  MonthName: string[];
  Registados: (string | number)[];
  Testados: (string | number)[];
  Rejeitados: (string | number)[];
  Pendentes: (string | number)[];
}

export type Props = {
  conventional: object[];
  poc: object[];
  columns: string[];
  containerProps?: BoxProps;
  labels?: string[];
}

export function KeyIndicatorsCard({conventional, poc, columns, containerProps, labels}: Props) {
  const [value, setValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const allSamples = [...conventional, ...poc];

  const groupedSamples = groupBy(allSamples, "indicator")
  const result = [
    mergeRows(groupedSamples.Pendentes),
    mergeRows(groupedSamples.Registadas),
    mergeRows(groupedSamples.Rejeitadas),
    mergeRows(groupedSamples.Testadas),
  ]

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
                value={index.toString()} 
                sx={{ fontWeight: "bold"}} 
              />
            ))}
          </TabList>
        </Box>
        <TabPanel value="1">
          <BasicTable rows={result} columns={columns}/>
        </TabPanel>
        <TabPanel value="2">
          <BasicTable rows={conventional} columns={columns}/>
        </TabPanel>
        <TabPanel value="3">
          <BasicTable rows={poc} columns={columns}/>
        </TabPanel>
      </TabContext>
    </Box>
  );
}

const mergeRows = data => {
  const result = {}; //(1)

  data?.forEach(basket => { //(2)
    for (const [key, value] of Object.entries(basket)) { //(3)
      if (result[key]) { //(4)
        if(typeof result[key] === "string") {
          result[key] = value; //(5)
        }
        else {
          result[key] += value; //(5)
        }
      } else { //(6)
        result[key] = value;
      }
    }
  });
  return result; //(7)
};
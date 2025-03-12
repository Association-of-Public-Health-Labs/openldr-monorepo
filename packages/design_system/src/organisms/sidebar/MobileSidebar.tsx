import Box from '@mui/material/Box';

import {MobileOptions, MobileOptionsProps} from "../../molecules/sidebar/MobileOptions";

export interface Props {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  options: MobileOptionsProps[]
}

export function MobileSidebar ({color, options}: Props) {

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: "100%",
        justifyContent: "space-between",
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <MobileOptions 
        color={color}
        options={options}
      />
    </Box>
  )
}
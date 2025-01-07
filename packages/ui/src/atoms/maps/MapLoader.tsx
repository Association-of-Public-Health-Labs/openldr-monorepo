import { Box } from "@mui/material";
import {PulseLoader} from "react-spinners";

type Props = {
  isLoading: boolean;
}

export function MapLoader({isLoading}: Props) {
  return (
    <Box sx={{
      padding: 2,
      boxShadow: 1,
      borderRadius: 4,
      backgroundColor: "background.paper",
      position: "absolute",
      top: 10,
      left: "50%",
      zIndex: 9999,
      display: isLoading ? "block" : "none"
    }}>
      <PulseLoader size={10} color="#111111"/>
    </Box>
  )
}
import {
  Box as Container, 
  ButtonGroup,
  Button
} from "@mui/material";
import { FiMinus, FiPlus } from "react-icons/fi";


export type ZoomControlProps = {
  handleIncreaseZoom: () => void,
  handleDecreaseZoom: () => void,
  hide?: boolean
}

export function ZoomControl ({
  handleIncreaseZoom, 
  handleDecreaseZoom,
  hide
}: ZoomControlProps) {
  return (
    <Container sx={{
      position: "absolute",
      right: "15px",
      bottom: "15px",
      zIndex: 9999,
      // ...(hide && {display: "none"})
    }}>
        <ButtonGroup
          orientation="vertical"
          color="inherit"
          aria-label="vertical contained primary button group"
          variant="contained"
          size="small"
          sx={{
            "& .MuiButtonGroup-grouped": {
              color: "text.primary",
              boxShadow: 2
            }
          }}
        >
          <Button 
            sx={{
              padding: 1,
              borderColor: "transparent",
              boxShadow: 2,
              backgroundColor: "background.paper",
              color: "text.primary"
            }}
            onClick={handleIncreaseZoom}
          >
            <FiPlus size={16} />
          </Button>
          <Button 
            sx={{
              padding: 1,
              borderColor: "transparent",
              boxShadow: 2,
              backgroundColor: "background.paper",
              color: "text.primary"
            }}
            onClick={handleDecreaseZoom}
          >
            <FiMinus size={16} />
          </Button>
        </ButtonGroup>
    </Container>
  )
}
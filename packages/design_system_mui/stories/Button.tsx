import React from "react";
import { Button as MuiButton} from "@mui/material";

// Example story
export default { title: "Example/Button" };

export const Button = () => (
  <MuiButton color="primary" variant="contained">
    Hello, I'm supposed to be red
  </MuiButton>
);

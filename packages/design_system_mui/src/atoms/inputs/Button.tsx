import {Button as MuiButton, ButtonProps} from "@mui/material";

export function Button (props: ButtonProps){
  return (
    <MuiButton 
      {...props}
      sx={{
        boxShadow: "none",
        borderRadius: "8px",
        color: "white",
        ...props?.sx,
      }}
    >
      {props?.children}
    </MuiButton>
  )
}
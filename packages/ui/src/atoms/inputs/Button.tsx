import {Button as MuiButton, ButtonProps} from "@mui/material";

export function Button (props: ButtonProps){
  return (
    <MuiButton 
      {...props}
      sx={{
        ...props?.sx,
        boxShadow: "none",
        borderRadius: "8px"
      }}
    >
      {props?.children}
    </MuiButton>
  )
}
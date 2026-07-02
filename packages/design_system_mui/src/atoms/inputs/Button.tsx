import {Button as MuiButton, ButtonProps} from "@mui/material";

export function Button (props: ButtonProps){
  const variant = props.variant ?? "text";
  return (
    <MuiButton 
      {...props}
      sx={{
        boxShadow: "none",
        borderRadius: "8px",
        color: variant === "contained" ? "white" : "inherit",
        ...props?.sx,
      }}
    >
      {props?.children}
    </MuiButton>
  )
}

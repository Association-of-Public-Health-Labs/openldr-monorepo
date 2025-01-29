import {Typography, TypographyProps} from "@mui/material";

export function Text (props: TypographyProps) {
  return (
    <Typography
      {...props}
    >
      {props.children}
    </Typography>
  )
}
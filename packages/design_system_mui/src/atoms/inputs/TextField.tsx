import { TextField as MuiTextField, TextFieldProps } from "@mui/material";

export function TextField (props: TextFieldProps) {
  return (
    <MuiTextField
      {...props}
      sx={{
        "& .MuiOutlinedInput-root.MuiInputBase-root": {
          borderRadius: "16px",
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: "rgba(145, 158, 171, 0.32)",
          },
          '&.Mui-focused fieldset': {
            borderWidth: 3,
          },
        },
        ...props.sx
      }}
      
    />
  )
}
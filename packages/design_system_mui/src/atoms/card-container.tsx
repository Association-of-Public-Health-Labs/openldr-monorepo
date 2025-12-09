import { Box, BoxProps } from "@mui/material";

export function CardContainer<T extends BoxProps>({ sx, ...rest }: T) {
  return (
    <Box
      {...rest}
      sx={{
        ...sx,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : theme.palette.background.paper,
      }}
    />
  )
}
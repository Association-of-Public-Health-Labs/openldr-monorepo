import { TextField } from "@mui/material";

export function DateRangeFilter() {
  return (
    <TextField
      disabled
      fullWidth
      helperText="Será ligado aos dados numa fase posterior"
      label="Intervalo de datas"
      placeholder="Selecionar período"
      size="small"
    />
  );
}

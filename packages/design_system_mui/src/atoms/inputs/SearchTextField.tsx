import React, {useState} from "react";
import {Button, FormControl, FormControlProps} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from "@mui/material/IconButton";
import {IoSearch} from "react-icons/io5";

type InputProps = {
  handleOnChange: (value: string) => void,
  handleOnClick: (value: string) => void
};
export type SearchTextFieldProps = FormControlProps & InputProps

export function SearchTextField(props: SearchTextFieldProps) {
  const [inputValue, setInputValue] = useState<string | undefined>()

  return (
    <FormControl {...props}>
      <InputLabel htmlFor="outlined-adornment-password">Pequisar</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type="text"
        onChange={(e) => {
          props?.handleOnChange(e.target.value)
          setInputValue(e.target.value)
        }}
        sx={{
          borderRadius: "16px"
        }}
        endAdornment={
          <InputAdornment position="end">
            {(inputValue) ?
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{
                    backgroundColor: "color.primary",
                    borderRadius: "8px",
                    color: "white"
                  }}
                  onClick={() => props?.handleOnClick && props?.handleOnClick(inputValue)}
                >
                  Pesquisar
                </Button>
              :
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => {}}
                  onMouseDown={() => {}}
                  edge="end"
                >
                  <IoSearch/>
                </IconButton>
            }
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  )
}

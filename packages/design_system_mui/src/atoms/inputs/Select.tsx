import React, {ReactNode} from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Select as MuiSelect, SelectChangeEvent } from "@mui/material";
import { IoChevronDown } from "react-icons/io5";

export type SelectProps = {
  children?: ReactNode,
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function Select({children, defaultValue, placeholder, onChange}: SelectProps) {
  const [value, setValue] = React.useState(defaultValue);

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string);
    onChange && onChange(event.target.value as string);
  };

  return (
      <FormControl>
        <InputLabel 
          id="demo-simple-select-label"
          sx={{
            padding: 0
          }}
        >{placeholder}</InputLabel>
        <MuiSelect
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label={placeholder}
          defaultValue={defaultValue}
          onChange={handleChange}
          size="small"
          sx={{
            borderRadius: "10px",
            minWidth: 200
          }}
          IconComponent = {IoChevronDown}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: theme => theme.palette.background.paper,
                boxShadow: 1,
                paddingLeft: 1, 
                paddingRight: 1,
                borderColor: "divider",
                marginTop: 1,
                borderRadius: "16px",
                '& .MuiMenuItem-root': {
                  borderRadius: "8px", 
                  marginBottom: 0.5,
                },
              },
            },
          }}
        >
          {children}
        </MuiSelect>
      </FormControl>
  );
}

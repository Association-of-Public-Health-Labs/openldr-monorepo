import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField } from "@mui/material";
import { format } from "date-fns";
import { useTheme } from "@mui/material/styles";

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  format?: string;
}

export const CustomDatePicker: React.FC<DatePickerProps> = ({
  label = 'Select date',
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  helperText,
  format: dateFormat = 'MM/dd/yyyy',
}) => {
  const theme = useTheme();

  const customStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.shape.borderRadius,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.palette.background.paper,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px',
      },
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.divider,
    },
    '& .MuiIconButton-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.primary,
      '&::placeholder': {
        color: theme.palette.text.secondary,
        opacity: 1,
      },
    },
    // Calendar popup styles
    '& .MuiPaper-root': {
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
    '& .MuiPickersDay-root': {
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: theme.palette.primary.main + '1A', // 10% opacity
      },
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
        },
      },
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        inputFormat={dateFormat}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={helperText}
            fullWidth
            sx={customStyles}
          />
        )}
      />
    </LocalizationProvider>
  );
};

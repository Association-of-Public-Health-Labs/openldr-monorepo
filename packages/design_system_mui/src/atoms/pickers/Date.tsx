import React from "react";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField, IconButton } from "@mui/material";
import { useTheme, styled } from "@mui/material/styles";
import { LuCalendarArrowDown } from "react-icons/lu";

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
  size?: "sm" | "md" | "lg";
}

// Styled DatePicker component to handle popup styles
const StyledDatePicker = styled(MuiDatePicker)(({ theme }) => ({
  "& .css-13whrds-MuiPaper-root-MuiPickersPopper-paper": {
    borderRadius: "16px !important",
  },
  "& .MuiPopper-root": {
    "& .MuiPaper-root": {
      borderRadius: "16px !important",
    }
  },
  "& .MuiDialog-root": {
    "& .MuiPaper-root": {
      borderRadius: "16px !important",
    }
  },
  "& .MuiDateCalendar-root": {
    borderRadius: "16px !important",
  },
  "& .MuiPickersLayout-root": {
    borderRadius: "16px !important",
  },
  "& .MuiPickersPopper-root": {
    "& .MuiPickersLayout-root": {
      borderRadius: "16px !important",
    }
  },
  "& .MuiCalendarPicker-root": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: "16px",
  },
  "& .MuiPickersDay-root": {
    color: theme.palette.text.primary,
    borderRadius: "50%",
    "&:hover": {
      backgroundColor: `${theme.palette.primary.main}1A`,
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  "& .MuiDayPicker-weekDayLabel": {
    color: theme.palette.text.secondary,
  },
  "& .MuiPickersCalendarHeader-root": {
    color: theme.palette.text.primary,
  },
  "& .MuiPickersCalendarHeader-label": {
    color: theme.palette.text.primary,
  },
  "& .MuiPickersArrowSwitcher-button": {
    color: theme.palette.primary.main,
  },
  "& .MuiPickersYear-yearButton": {
    color: theme.palette.text.primary,
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
  "& .MuiPickersMonth-monthButton": {
    color: theme.palette.text.primary,
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
  },
}));

export const DatePicker: React.FC<DatePickerProps> = ({
  label = "Select date",
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  error = false,
  helperText,
  format: dateFormat = "dd/MM/yyyy",
  size = "md",
}) => {
  const theme = useTheme();
  console.log("theme", theme?.palette.mode);

  const getMuiSize = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "small";
      case "lg":
        return "medium";
      default:
        return "medium";
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.palette.background.paper,
      ...(size === "lg" && {
        padding: "4px",
        "& input": {
          padding: "16.5px 14px",
        }
      }),
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "1px",
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
      "&.Mui-focused": {
        color: theme.palette.primary.main,
      },
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.divider,
    },
    "& .MuiIconButton-root": {
      color: theme.palette.primary.main,
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <StyledDatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        inputFormat={dateFormat}
        components={{
          OpenPickerIcon: LuCalendarArrowDown
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            helperText={helperText}
            fullWidth
            size={getMuiSize(size)}
            sx={inputStyles}
          />
        )}
      />
    </LocalizationProvider>
  );
};

import React from "react";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  DesktopDatePicker,
  DesktopDatePickerProps,
} from "@mui/x-date-pickers/DesktopDatePicker";
import { IoChevronDown } from "react-icons/io5";

const CssTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  // Example focus override for outlined variant
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  // If using standard or filled, override their selectors similarly:
  "& .MuiInput-underline:after": {
    borderBottomColor: theme.palette.primary.main,
  },
  "& .MuiFilledInput-underline:after": {
    borderBottomColor: theme.palette.primary.main,
  },
}));

const CssDesktopDatePicker = styled(DesktopDatePicker)(({ theme }) => ({
  // Override nested elements with class selectors
  "& .MuiFormControl-root.MuiTextField-root": {
    width: "100%",
  },

  // Example: override day cells
  "& .MuiCalendarPicker-root .MuiPickersDay-root": {
    "&.Mui-selected": {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
    },
  },
}));

export function DatePicker(props: DesktopDatePickerProps<Date, Date>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <CssDesktopDatePicker
        {...props}
        label={props.label}
        views={["year", "month", "day"]}
        // @ts-ignore
        format="dd/MM/yyyy"
        components={{
          OpenPickerIcon: () => <IoChevronDown size={18} />,
        }}
        // PaperProps can also use 'sx' for custom styling:
        PaperProps={{
          sx: {
            borderRadius: 2, // 16px ~ 2 if using 8px scale
            // Override selected day color
            "button.Mui-selected": {
              backgroundColor: theme => theme.palette.primary.main,
              color: "#fff",
            },
          },
        }}
        // The renderInput prop reuses our styled TextField
        renderInput={(params) => (
          <CssTextField
            {...params}
            // Additional input styles can go here:
            inputProps={{
              ...params.inputProps,
              style: { height: 40 },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}

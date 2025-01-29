import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker, DesktopDatePickerProps } from "@mui/x-date-pickers/DesktopDatePicker";
import { makeStyles, createStyles } from "@mui/material";
import { styled } from "@mui/material/styles";
import { IoChevronDown } from "react-icons/io5";

const useStyles = makeStyles(() =>
  createStyles({
    focused: {
      outlineColor: "primary",
      borderColor: "primary",
      "&:focus": {
        borderColor: "primary",
      }
    },
    noBorder: {
      outline: "none",
      border: "none",
    },
    root: {
      outlineColor: "primary",
      "&::focus": {
        borderColor: "primary",
        outlineColor: "primary",
      },
    },
    input: {
      "&:focus": {
        borderColor: "primary",
      }
    },
    datePickerStyle: {
      ".css-1fdf4qj-MuiButtonBase-root-MuiPickersDay-root.Mui-selected": {
      backgroundColor: "red",
      color: "#000000"
    },}
  })
);

const CssTextField = styled(TextField, {
    shouldForwardProp: (props) => props !== "focusColor"
  })((p) => ({
  // input label when focused
  width: "100%",
  "& label.Mui-focused": {
    color: "primary"
  },
  // focused color for input with variant="standard"
  "& .MuiInput-underline:after": {
    borderBottomColor: "primary"
  },
  // focused color for input with variant="filled"
  "& .MuiFilledInput-underline:after": {
    borderBottomColor: "primary"
  },
  // focused color for input with variant="outlined"
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "&.Mui-focused fieldset": {
      borderColor: "primary"
    },
  }
}));

const CssDesktopDatePicker = styled(DesktopDatePicker, {
  shouldForwardProp: (props) => props !== "focusColor"
})((p) => ({
  "& .MuiFormControl-root.MuiTextField-root": {
    width: "100%"
  },
// focused color for input with variant="standard"
"& .MuiCalendarPicker-root": { 
  "& .MuiButtonBase-root-MuiPickersDay-root": {
    "& .Mui-selected": {
      backgroundColor: "primary",
    }
  }
},
// focused color for input with variant="filled"
"& .MuiFilledInput-underline:after": {
  borderBottomColor: "primary"
},
// focused color for input with variant="outlined"
"& .MuiOutlinedInput-root": {
  "&.Mui-focused fieldset": {
    borderColor: "primary"
  }
}
}));

export interface Props {
   props?: DesktopDatePickerProps<any, any>;  
}

export function DatePicker (props: DesktopDatePickerProps<any, any>) {
  const classes = useStyles();
  const themeProps = useTheme();

  return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssDesktopDatePicker
              {...props}
              label={props?.label}
              views={["year", "month", "day"]}
              format="dd/MM/yyyy"
              // @ts-ignore
              renderInput={(params) => (
                <CssTextField
                  {...params } 
                />
              )}
              sx={{
                "& .MuiFormControl-root.MuiTextField-root": {
                  width: "100%"
                },
              }}
              components={{
                OpenPickerIcon: () => <IoChevronDown size={18}/>,
              }}
              componentsProps={{

              }}
              PaperProps={{
                style: {
                  borderRadius: "16px",
                },
                sx: {
                  "button.Mui-selected.MuiButtonBase-root.MuiPickersDay-root.MuiPickersDay-dayWithMargin.MuiPickersDay-today": {
                    color: "white",
                  },
                  "button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected.MuiPickersDay-dayWithMargin": {
                    color: "white",
                  },
                  "button.PrivatePickersYear-yearButton.Mui-selected": {
                    color: "white",
                  },
                  "button.MuiTypography-root.MuiTypography-h5.PrivatePickersMonth-root.Mui-selected": {
                    color: "white",
                  },
                  "button.MuiButtonBase-root.MuiPickersDay-root.MuiPickersDay-dayWithMargin": {
                    backgroundColor: "transparent"
                  },
                  "button.MuiButtonBase-root.MuiPickersDay-root.MuiPickersDay-dayWithMargin.Mui-selected": {
                    backgroundColor: themeProps?.palette.primary.main
                  }
                },
                className: classes.datePickerStyle
              }}
              InputProps={{
                style: {
                  height: "40px",
                  // width: "100%"
                },
                classes: {
                  focused: classes.noBorder,
                  root: classes.root,
                  input: classes.input
                },
              }}
              
            />
        </LocalizationProvider>
  );
}
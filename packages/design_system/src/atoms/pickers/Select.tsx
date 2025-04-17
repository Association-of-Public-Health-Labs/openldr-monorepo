import React from "react";
import ReactSelect from "react-select";
import makeAnimated from "react-select/animated";
import {useTheme} from "@mui/material/styles";
import hexToRgba from "hex-to-rgba";

export interface optionsProps {
  value: string | undefined;
  label: string;
  color?: string;
  isFixed?: boolean;
  isDisabled?: boolean;
  district?: string;
  province?: string;
}

const animatedComponents = makeAnimated();

export interface Props {
  options: optionsProps[];
  placeholder: string;
  isMulti?: boolean;
  values?: optionsProps[];
  isDisabled?: boolean;
  onChange: (selected: optionsProps[]) => void;
  isDefaultPlaceholderActive?: boolean;
  width?: string | number;
  closeMenuOnSelect?: boolean;
}

export const Select = ({
  options,
  placeholder,
  isMulti = true,
  values,
  isDisabled,
  onChange,
  isDefaultPlaceholderActive = false,
  width = "100%",
  closeMenuOnSelect = false
}: Props) => {
  const theme = useTheme();
  const gray = theme.palette.grey[300];

  const customStyles = SelectStyles({
    primaryColor: theme.palette.primary.main,
    textInputBorder: gray,
    backgroundColor: theme.palette.background.paper,
    fontFamily: theme.typography.fontFamily as string,
    themeMode: theme.palette.mode,
    width: width,
    size: "md",
    isDefaultPlaceholderActive: isDefaultPlaceholderActive
  });


  return (
    <div style={{position: "relative"}}>
      <span 
        style={{
          position: "absolute", 
          zIndex: 1000,
          top: -10, 
          left: 10, 
          backgroundColor: theme.palette.background.paper, 
          color: theme.palette.text.secondary, 
          fontSize: "12px", 
          padding: "0 5px",
        }}
      >
        {placeholder}
      </span>
      {/* @ts-ignore */}
      <ReactSelect
        closeMenuOnSelect={closeMenuOnSelect}
        components={animatedComponents}
        defaultValue={values}
        value={values}
        isMulti={isMulti}
        options={options}
        styles={customStyles}
        onChange={(newValue: any) => {
          if (Array.isArray(newValue)) {
            onChange(newValue as optionsProps[]);
          } else if (newValue) {
            onChange([newValue] as optionsProps[]);
          } else {
            onChange([]);
          }
        }}
        placeholder={placeholder || "Selecione..."}

      />
    </div>
  );
}

interface ColorsProps {
  primaryColor: string;
  textInputBorder: string;
  backgroundColor: string;
  fontFamily: string;
  themeMode?: "light" | "dark";
  width?: number | string;
  size?: "sm" | "md" | "lg";
  isDefaultPlaceholderActive?: boolean;
}

export const SelectStyles = ({
  primaryColor, 
  textInputBorder, 
  backgroundColor, 
  fontFamily, 
  themeMode="light",
  width="100%",
  size="md",
  isDefaultPlaceholderActive=false
}: ColorsProps) => {
  const getHeight = () => {
    switch (size) {
      case "sm":
        return 40;
      case "lg":
        return 64;
      default:
        return 56;
    }
  };

  return {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "1px solid " + textInputBorder,
      borderRadius: "10px",
      marginBottom: 15,
      minHeight: getHeight(),
      width: width,
      boxShadow: 0,
      borderColor: state.isFocused ? primaryColor : provided.borderColor,
      "&:hover": {
        borderColor: state.isFocused ? primaryColor : provided.borderColor
      },
      fontFamily: fontFamily,
      backgroundColor: "transparent",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: hexToRgba(primaryColor, "0.1"),
      color: primaryColor
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: primaryColor
    }),
    option: (styles: any, state: any) => ({
      ...styles,
      backgroundColor: state.isSelected
        ? hexToRgba(primaryColor, "0.1")
        : backgroundColor,
      fontFamily: fontFamily,
      color: themeMode === "light" ? "#333333" : "#fff",
      "&:hover": {
        backgroundColor: hexToRgba(primaryColor, "0.1"),
        color: primaryColor
      }
    }),
    menu: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: backgroundColor,
      borderRadius: "16px",
      overflow: "hidden",
    }),
    indicatorSeparator: () => ({
      display: "none"
    }),
    ...(isDefaultPlaceholderActive && {
      placeholder: (provided: any) => ({
        ...provided,
        color: "white",
        fontSize: "14px",
        fontFamily: fontFamily,
        backgroundColor: themeMode === "light" ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.5)",
        fontWeight: "bold",
        width: "160px",
        padding: "0 10px",
        borderRadius: "4px",
      })
    }),
  };
};

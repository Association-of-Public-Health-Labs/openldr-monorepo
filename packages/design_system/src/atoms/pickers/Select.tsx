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
  options?: optionsProps[];
  defaultValue?: optionsProps[];
  isMulti?: boolean;
  closeMenuOnSelect?: boolean;
  onChange?: (newValue: any) => void;
  width?: number | string;
  placeholder?: string;
  values?: optionsProps[];
  size?: "sm" | "md" | "lg";
  isDefaultPlaceholderActive?: boolean;
}

export const Select = ({
  options,
  closeMenuOnSelect=false,
  defaultValue,
  isMulti=true,
  onChange,
  width="100%",
  placeholder,
  values,
  size="md",
  isDefaultPlaceholderActive=false
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
    size: size,
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
        defaultValue={defaultValue}
        value={values}
        isMulti={isMulti}
        options={options}
        styles={customStyles}
        onChange={(newValue, actionMeta) => onChange && onChange(newValue)}
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

import React from "react";

export interface LogoProps {
  size?: "small" | "medium" | "large";
  width?:  number | string;
}

export function Logo ({ size = "medium", width }: LogoProps) {
  return (
    <img
      src="https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png"
      style={{
        width: width || ((size === "small") ? "50px" : ((size === "medium") ? "100px" : "400px"))
      }} 
    />
  )
}
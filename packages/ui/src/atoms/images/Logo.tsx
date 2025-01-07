import React from "react";

export interface Props {
  size?: "small" | "medium" | "large";
  width?:  number | string;
}

export function Logo ({ size = "medium", width }: Props) {
  return (
    <img
      src="https://res.cloudinary.com/dduwau07t/image/upload/v1658937655/emblem_fwcqku.png"
      style={{
        width: width || ((size === "small") ? "50px" : ((size === "medium") ? "100px" : "400px"))
      }} 
    />
  )
}
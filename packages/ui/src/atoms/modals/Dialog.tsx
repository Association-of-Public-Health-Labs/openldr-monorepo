import * as React from "react";
import {Dialog as MUIDialog, DialogProps } from "@mui/material";

export type Props = {

}

export function Dialog(props: DialogProps) {
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<DialogProps["maxWidth"]>("sm");

  return (
      <MUIDialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        sx={{
          "& .MuiPaper-root.MuiPaper-rounded.MuiDialog-paper.MuiDialog-paperScrollPaper": {
            borderRadius: "16px"
          }
        }}
        {...props}
      >
        {props?.children}
      </MUIDialog>
  );
}
import * as React from "react";
import {Dialog as MUIDialog, DialogProps as MuiDialogProps } from "@mui/material";

export type DialogProps = {

}

export function Dialog(props: MuiDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState<MuiDialogProps["maxWidth"]>("sm");

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
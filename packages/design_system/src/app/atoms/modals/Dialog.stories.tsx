import { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { Dialog, type DialogProps } from "./Dialog";
import { Button, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const meta: Meta<typeof Dialog> = {
  title: "DesignSystem/Atoms/Modals/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  argTypes: {
    fullWidth: {
      description: "Whether the dialog should take up the full width of the viewport.",
      control: { type: "boolean" },
    },
    maxWidth: {
      description: "The maximum width of the dialog.",
      control: {
        type: "select",
        options: ["xs", "sm", "md", "lg", "xl", false],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The **Dialog** component renders a Material-UI dialog with configurable width and styling.

### Features
- Configurable \`fullWidth\` and \`maxWidth\` props for responsive dialogs.
- Supports passing children for custom content.
- Easily integrates with Material-UI's Dialog sub-components for headers, footers, and body content.
        `,
      },
    },
  },
};

export default meta;

// Template for the component
const Template: StoryFn<{ fullWidth: boolean; maxWidth: string | false }> = (args) => {
  const [open, setOpen] = useState(true);

  const handleClickOpen = () => {};
  const handleClose = () => {};

  return (
    <>
      {/* <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Open Dialog
      </Button> */}
      {open && (
        <Dialog {...args as DialogProps} open={open} onClose={handleClose}>
          <DialogTitle>Sample Dialog</DialogTitle>
          <DialogContent>This is a customizable dialog component.</DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleClose} color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

// Default story
export const Default = Template.bind({});
Default.args = {
  fullWidth: true,
  maxWidth: "sm",
};

// Custom story with larger size
export const LargeDialog = Template.bind({});
LargeDialog.args = {
  fullWidth: true,
  maxWidth: "lg",
};

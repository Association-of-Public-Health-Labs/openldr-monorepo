import React, { ReactNode, useState } from "react";
export type Props = {
  children?: ReactNode;
  documentation?: any
}

type CommentsType = "doubt" | "suggestion";

export function CardDialog({children, documentation}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [commentsType, setCommentsType] = useState<CommentsType>("doubt");

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChangeCommentsType = (
    event: React.MouseEvent<HTMLElement>,
    commentsType: CommentsType,
  ) => {
    setCommentsType(commentsType);
  };

  return (
    <></>
  )
}
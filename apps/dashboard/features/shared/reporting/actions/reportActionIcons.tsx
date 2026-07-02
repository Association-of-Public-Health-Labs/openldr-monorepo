"use client";

import {
  BookOpen,
  CalendarRange,
  Check,
  ListTree,
  MessageCircleQuestion,
  MoreHorizontal,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";

const iconSize = 18;

function withSize(Icon: LucideIcon) {
  return <Icon aria-hidden size={iconSize} />;
}

export const reportActionIcons = {
  apply: withSize(Check),
  close: withSize(X),
  dateFilter: withSize(CalendarRange),
  documentation: withSize(BookOpen),
  drillDown: withSize(ListTree),
  feedback: withSize(MessageCircleQuestion),
  menu: withSize(MoreHorizontal),
  resetFilters: withSize(RotateCcw),
};

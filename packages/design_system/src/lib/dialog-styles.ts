// Minimals dialog buttons and fields, measured on minimals.cc (2026-10-19): 36px tall, 8px radius,
// 14px bold; the main action dark ("inherit" contained), the other outlined.
export const DIALOG_BUTTON =
  "h-9 rounded-lg px-3 text-sm font-bold shadow-none transition-colors disabled:pointer-events-none disabled:opacity-50";
export const DIALOG_BUTTON_PRIMARY = `${DIALOG_BUTTON} bg-[#1C252E] text-white hover:bg-[#454F5B] dark:bg-white dark:text-[#1C252E] dark:hover:bg-[#C4CDD5]`;
export const DIALOG_BUTTON_OUTLINE = `${DIALOG_BUTTON} border border-[rgba(145,158,171,0.32)] bg-transparent text-[#1C252E] hover:bg-[rgba(145,158,171,0.08)] dark:text-white`;

/** Field labels in the filter dialogs. */
export const DIALOG_LABEL = "text-sm font-semibold text-[#1C252E] dark:text-white";

import React from "react";

/** Room each x-axis category needs to stay readable, plus the y axes and padding. */
export const CATEGORY_WIDTH = 28;
const AXES_WIDTH = 96;

/** The narrowest width at which a chart's categories stay readable; undefined when there are none. */
export function chartMinWidth(categories: number, perCategory = CATEGORY_WIDTH): number | undefined {
  return categories > 0 ? categories * perCategory + AXES_WIDTH : undefined;
}

/**
 * Lets a chart with many categories (labs, provinces, months) scroll sideways inside its card when
 * the card is narrower than the chart needs, e.g. on phones, instead of squeezing the labels on top
 * of each other. Wider cards are unaffected.
 */
export function ChartScroller({
  categories,
  perCategory,
  children,
}: {
  categories: number;
  perCategory?: number;
  children: React.ReactNode;
}) {
  return (
    <div data-chart-scroll="" style={{ overflowX: "auto", overflowY: "hidden" }}>
      <div style={{ minWidth: chartMinWidth(categories, perCategory) }}>{children}</div>
    </div>
  );
}

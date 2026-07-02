"use client";

import { Breadcrumbs, Link, Typography } from "@mui/material";

type GeoDrillDownBreadcrumbProps = {
  district?: string;
  facility?: string;
  onNavigate?: (level: "district" | "facility" | "province") => void;
  province?: string;
};

export function GeoDrillDownBreadcrumb({ district, facility, onNavigate, province }: GeoDrillDownBreadcrumbProps) {
  const items = [
    { label: "Moçambique", level: undefined },
    { label: province, level: "province" as const },
    { label: district, level: "district" as const },
    { label: facility, level: "facility" as const },
  ].filter((item) => item.label);

  return (
    <Breadcrumbs aria-label="Caminho do drill-down" sx={{ fontSize: 12.5 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1 || !item.level;
        if (isLast || !onNavigate) {
          return (
            <Typography color={isLast ? "text.primary" : "text.secondary"} fontSize={12.5} fontWeight={800} key={item.label}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            component="button"
            key={item.label}
            onClick={() => onNavigate(item.level)}
            sx={{ border: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 800, p: 0 }}
            underline="hover"
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}


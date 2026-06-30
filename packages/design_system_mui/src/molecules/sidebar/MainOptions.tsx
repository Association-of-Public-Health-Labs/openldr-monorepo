import React, {ReactNode, useEffect, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

import {SideBarMenuButton} from "../../atoms/inputs/SideBarMenuButton";

export interface OptionsProps {
  icon?: ReactNode;
  label?: string;
  active?: boolean;
  href?: string;
  basePath?: string;
  children?: OptionsProps[];
  hideLabelWhenCompact?: boolean;
}

export interface MainOptionsProps {
  color: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning" ;
  variant: "row" | "column";
  options: OptionsProps[];
  stacked?: boolean;
  navigationColor?: "integrate" | "apparent"
}

export function MainOptions({color, variant, options, stacked=true, navigationColor}: MainOptionsProps) {
  const activeGroupLabels = useMemo(
    () =>
      (options || [])
        .filter((option) => option.active || option.children?.some((child) => child.active))
        .map((option) => option.label)
        .filter(Boolean) as string[],
    [options],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenGroups((current) => {
      const next = { ...current };
      activeGroupLabels.forEach((label) => {
        next[label] = true;
      });
      return next;
    });
  }, [activeGroupLabels]);

  const toggleGroup = (label?: string) => {
    if (!label) return;
    setOpenGroups((current) => ({
      ...current,
      [label]: !current[label],
    }));
  };

  if(stacked) {
    return (
      <Box 
        className=""
        sx={{ width: "100%" }}
      >
        <Stack spacing={1}>
          {
            Array.isArray(options) && options?.map((option, index) => {
              const hasChildren = Array.isArray(option.children) && option.children.length > 0;
              const isActive = option?.active || option.children?.some((child) => child.active) || false;
              const isOpen = Boolean(option.label && openGroups[option.label]);
              const compact = variant === "column";

              if (hasChildren && compact) {
                return (
                  <SideBarMenuButton
                    key={index}
                    color={color}
                    variant={variant}
                    icon={option.icon}
                    label={option.label}
                    active={isActive}
                    href={option?.href || option?.children?.[0]?.href}
                    navigationColor={navigationColor}
                    hideLabel
                    tooltip={option.label}
                  />
                );
              }

              return (
                <Box key={index} sx={{ width: "100%" }}>
                  <SideBarMenuButton
                    color={color}
                    variant={variant}
                    icon={option.icon}
                    label={option.label}
                    active={isActive}
                    href={hasChildren ? undefined : option?.href}
                    onClick={hasChildren ? (event) => {
                      event.preventDefault();
                      toggleGroup(option.label);
                    } : undefined}
                    navigationColor={navigationColor}
                    hideLabel={compact && option.hideLabelWhenCompact}
                    tooltip={option.label}
                    endIcon={
                      hasChildren
                        ? isOpen
                          ? <IoChevronDown size={14} />
                          : <IoChevronForward size={14} />
                        : undefined
                    }
                  />
                  {hasChildren && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <Stack spacing={0.5} sx={{ pl: 2, pt: 0.5 }}>
                        {option.children?.map((child, childIndex) => (
                          <SideBarMenuButton
                            key={`${index}-${childIndex}`}
                            color={color}
                            variant="row"
                            icon={child.icon}
                            label={child.label}
                            active={child.active || false}
                            href={child.href}
                            navigationColor={navigationColor}
                            sx={{
                              minHeight: 32,
                              paddingTop: 4,
                              paddingBottom: 4,
                              paddingLeft: 12,
                            }}
                          />
                        ))}
                      </Stack>
                    </Collapse>
                  )}
                </Box>
              );
            })
          }
        </Stack>
      </Box>
    );
  }

  return (
    <Box 
        className=""
        sx={{ width: "100%" }}
    >
      <Stack direction="row" spacing={1}>
        {
          Array.isArray(options) && options?.map((option, index) => (
            <SideBarMenuButton
              key={index}
              color={color}
              variant="row"
              icon={option.icon}
              label={option.label}
              active={option?.active || option.children?.some((child) => child.active) || false}
              href={option?.href || option?.children?.[0]?.href}
              width={"auto"}
              navigationColor={navigationColor}
              sx={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            />
          ))
        }
      </Stack>
    </Box>
  )
}

"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Box, Typography } from "@mui/material";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

type MainCardComponent = ComponentType<any>;

const placeholderUser = {
  name: "Utilizador OpenLDR",
  email: "utilizador@openldr.org.mz",
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const [MainCard, setMainCard] = useState<MainCardComponent | null>(null);

  useEffect(() => {
    let mounted = true;

    import("@repo/design_system_mui/organisms/cards/MainCard").then((module) => {
      if (mounted) {
        setMainCard(() => module.MainCard);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!MainCard) {
    return (
      <Box sx={{ width: "100%", pb: 4 }}>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            minHeight: 260,
            display: "grid",
            alignContent: "center",
            gap: 2,
            bgcolor: "background.paper",
          }}
        >
          <Typography color="text.primary" fontSize={18} fontWeight={700}>
            {title}
          </Typography>
          <Typography color="text.secondary" fontSize={14}>
            A preparar o componente visual...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <MainCard
        height="auto"
        id={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-placeholder`}
        subtitle="Base preparada para migração incremental dos relatórios"
        title={title}
        user={placeholderUser}
        bodyProps={{
          sx: {
            p: 3,
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            minHeight: 220,
            alignContent: "center",
          }}
        >
          <Typography color="text.primary" fontSize={18} fontWeight={700}>
            {title}
          </Typography>
          <Typography color="text.secondary" fontSize={14} lineHeight={1.7} maxWidth={720}>
            {description}
          </Typography>
          <Typography color="text.secondary" fontSize={13}>
            Os cards reais serão migrados numa fase posterior, mantendo os contratos da API atual.
          </Typography>
        </Box>
      </MainCard>
    </Box>
  );
}

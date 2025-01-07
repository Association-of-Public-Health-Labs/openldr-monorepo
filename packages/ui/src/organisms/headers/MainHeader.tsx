import {
  Box as Header,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import hexToRgba from "hex-to-rgba";

import {UserNavigation, UserProps} from "../../molecules/headers/UserNavigation";
import {SettingsDrawer} from "../../molecules/headers/SettingsDrawer";
import { BsQuestionCircle } from "react-icons/bs";
import { SettingsProps } from "../../types/global";

export type Props = {
  pagename?: string,
  user?: UserProps,
  settings: SettingsProps,
  handleSetAppSettings: (settings: SettingsProps) => void
  handleOpenSettingsModal?: () => void
}

export function MainHeader ({pagename, user, settings, handleSetAppSettings, handleOpenSettingsModal}: Props) {

  return (
    <Header
      className="second-step"
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        width: "100%",
        height: "100px",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        backdropFilter: "blur(6px)",
        boxShadow: "none",
        // backgroundColor: "rgba(255,255,255,0.8)",
        backgroundColor: theme => (
          hexToRgba(
            // theme.palette.background?.paper,
            (theme?.palette.mode === "light" && settings?.contrast === "negative") ? theme.palette.background.default : theme.palette.background.paper,
            "0.8"
          )
        )
      }}
    >
      <Typography 
        variant="h5"
        sx={{
          fontWeight: "600",
          color: theme => theme.palette.text.primary
        }}
      >
        {pagename}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1
        }}
      >
        {handleOpenSettingsModal && 
          <IconButton 
            aria-label="tour" 
            size="medium"
            sx={{display: {xs: "none", sm: "flex"}}}
            onClick={handleOpenSettingsModal}
          >
            <BsQuestionCircle />
          </IconButton>
        }
        <SettingsDrawer settings={settings} handleSetAppSettings={handleSetAppSettings} />
        {user && <UserNavigation user={user}/>}
      </Box>
    </Header>
  )
}
import {
  Box as Header,
  Box,
  IconButton,
  SxProps
} from "@mui/material";
import hexToRgba from "hex-to-rgba";

import {UserNavigation, UserProps} from "../../molecules/headers/UserNavigation";
import {SettingsDrawer} from "../../molecules/headers/SettingsDrawer";
import { BsQuestionCircle } from "react-icons/bs";
import { SettingsProps } from "../../molecules/headers/SettingsDrawer";

export type Props = {
  user?: UserProps,
  settings: SettingsProps,
  handleSetAppSettings: (settings: SettingsProps) => void
  handleOpenSettingsModal?: () => void
  children?: React.ReactNode
  sx?: SxProps
}

export function MainHeader ({ children, user, settings, handleSetAppSettings, handleOpenSettingsModal, sx }: Props) {

  return (
    <Header
      className="second-step"
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "80px",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99,
        ...sx
      }}
    >
      <div>{children}</div>
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
            size="small"
            sx={{display: {xs: "none", sm: "flex"}}}
            onClick={handleOpenSettingsModal}
          >
            <BsQuestionCircle />
          </IconButton>
        }
        <SettingsDrawer 
          settings={settings} 
          handleSetAppSettings={handleSetAppSettings} 
        />
        {user && <UserNavigation user={user}/>}
      </Box>
    </Header>
  )
}
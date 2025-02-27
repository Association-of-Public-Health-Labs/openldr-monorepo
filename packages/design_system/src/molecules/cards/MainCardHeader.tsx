import React, {useState, MouseEvent, useEffect} from "react";
import {Box, BoxProps, Typography, IconButton, Menu as MUIMenu, MenuItem, Divider} from "@mui/material";
import { Menu } from "../../atoms/navigation/Menu";
import {IoEllipsisHorizontalSharp} from "react-icons/io5";

export type Options = {
  label: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  optionToExportData?: boolean;
  type?: "primary" | "secondary";
}

export type Props = {
  title?: string;
  subtitle?: string;
  options?: Options[];
  additionalOptions?: Options[];
  containerProps?: BoxProps;
  width?: string | number;
  handleSetContextOptions: (options: Options[]) => void
}

export function MainCardHeader({title, subtitle, options, additionalOptions, containerProps, width="100%", handleSetContextOptions}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const {handleSetContextOptions} = useContext(CardContext);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if(typeof additionalOptions !== "undefined" && typeof handleSetContextOptions !== "undefined"){
      handleSetContextOptions(additionalOptions)
    }
  },[additionalOptions, handleSetContextOptions])

  return (
    <Box
      {...containerProps }
      sx={{
        width: width,
        padding: 0,
        margin: 0,
        ...containerProps?.sx
      }}
    >
      <Box sx={{
        paddingBottom: 1,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}>
          {subtitle && (
            <Typography fontSize="0.83rem" variant="h6" sx={{
              color: "text.disabled",
              fontWeight: 600,
            }}>
              {subtitle}
            </Typography>
          )}
          <Typography variant="h5" sx={{
            color: "text.primary",
            fontWeight: 600,
            fontSize: "1.17em"
          }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}>
          {
            options?.map((option, index) => (
              <IconButton 
                key={index} 
                aria-label={option?.label || "icone"} 
                size="medium"
                onClick={() => option?.action && option.action()}
              >
                {option?.icon}
              </IconButton>
            ))
          }
          {additionalOptions?.length > 0 && (
            <Box sx={{marginLeft: 1}}> 
              <IconButton  
                size="medium"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              >
                <IoEllipsisHorizontalSharp size={20}/>
              </IconButton>
              <Menu 
                id="options-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                  marginTop: 5,
                }}
              >
                {additionalOptions?.map((option, index) => (
                  option?.type === "primary" && 
                    <MenuItem 
                      key={index}
                      onClick={() => {
                        handleClose
                        option?.action && option.action();
                      }}
                      sx={{
                        borderRadius: 2,
                        padding: 1,
                        marginLeft: 1,
                        marginRight: 1,
                        width: "200px",
                      }}
                    >
                      {option?.icon}
                      <Typography sx={{marginLeft: 1}}>{option?.label}</Typography>
                    </MenuItem>
                ))}
                <Divider sx={{ 
                    my: 0.5, 
                    marginTop: 0.5, 
                    marginBottom: 0.5, 
                    height: "1px",
                  }} 
                />
                {additionalOptions?.map((option, index) => (
                  option?.type === "secondary" && 
                    <MenuItem 
                      key={index}
                      onClick={() => {
                        handleClose
                        option?.action && option.action();
                      }}
                      sx={{
                        borderRadius: 2,
                        padding: 1,
                        marginLeft: 1,
                        marginRight: 1,
                      }}
                    >
                      {option?.icon}
                      <Typography sx={{marginLeft: 1}}>{option?.label}</Typography>
                    </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
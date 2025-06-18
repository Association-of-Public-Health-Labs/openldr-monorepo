import React, {createContext, useState, ReactNode} from "react";
import { Box, Divider, MenuItem, Typography, useTheme } from "@mui/material";
import { CSVLink, CSVDownload } from "react-csv";
import { Menu as ContextMenu } from "../atoms/navigation/Menu";
import { Options } from "../molecules/cards/MainCardHeader";

type CardContextProps = {
  additionalOptions?: Options[]; 
  handleSetContextOptions: (options: Options[]) => void;
}

type Props = {
  children: ReactNode;
  csvFile: CsvFileProps;
}

export type CsvFileProps = {
  filename?: string;
  data?: any[];
  headers?: {label: string, key: string}[]
}

export const CardContext = createContext({} as CardContextProps);

export function CardProvider({children, csvFile}: Props) {
  const theme = useTheme(); 
  const [contextOptions, setContextOptions] = useState<Options[]>([]);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleSetContextOptions = (options: Options[]) => {
    setContextOptions(options);
  }

  return (
    <CardContext.Provider value={{handleSetContextOptions: function (options: Options[]){setContextOptions(options)}}}>
      <Box onContextMenu={handleContextMenu}>
        {children}
        <ContextMenu 
            open={contextMenu !== null}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            {contextOptions?.map((option, index) => (
              option?.type === "primary" && (
                option?.optionToExportData ? 
                  // <CSVLink
                  //   key={index}
                  //   style={{
                  //     textDecoration: "none",
                  //     color: theme.palette.text.primary
                  //   }}
                  //   filename={csvFile?.filename}
                  //   data={csvFile?.data || ""}
                  //   headers={csvFile?.headers}
                  // >
                  <div>
                    <MenuItem 
                      key={index}
                      onClick={() => {
                        option?.action && option.action();
                        handleClose
                      }}
                      sx={{
                        borderRadius: 2,
                        padding: 1,
                        marginLeft: 1,
                        marginRight: 1,
                        textDecoration: "none"
                      }}
                    >
                      {option?.icon}
                      <Typography sx={{marginLeft: 2}}>{option?.label}</Typography>
                    </MenuItem>
                  </div>
                  // </CSVLink>
                :
                  <MenuItem 
                    key={index}
                    onClick={() => {
                      option?.action && option.action();
                      handleClose
                    }}
                    sx={{
                      borderRadius: 2,
                      padding: 1,
                      marginLeft: 1,
                      marginRight: 1,
                    }}
                  >
                    {option?.icon}
                    <Typography sx={{marginLeft: 2}}>{option?.label}</Typography>
                  </MenuItem>
              )
            ))}
            <Divider sx={{ 
              my: 0.5, 
              marginTop: 1, 
              marginBottom: 1, 
              border: "none",
              borderTop: "1px dashed rgba(145, 158, 171, 0.24)" 
              }} 
            />
            {contextOptions?.map((option, index) => (
              option?.type === "secondary" && 
                <MenuItem 
                  key={index}
                  onClick={() => {
                    option?.action && option.action();
                    handleClose
                  }}
                  sx={{
                    borderRadius: 2,
                    padding: 1,
                    marginLeft: 1,
                    marginRight: 1,
                  }}
                >
                  {option?.icon}
                  <Typography sx={{marginLeft: 2}}>{option?.label}</Typography>
                </MenuItem>
            ))}
          </ContextMenu>
      </Box>
    </CardContext.Provider>
  )
}
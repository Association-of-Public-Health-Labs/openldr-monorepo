import { Box } from "@mui/material"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import React from "react"
import { ScrollArea } from "../../../components/ui/scroll-area"

export type Props = {
  children: React.ReactNode, 
  documentation?: React.ReactNode, 
  open: boolean, 
  setOpen: (open: boolean) => void,
  loading?: boolean
}

export const CardDocsPopup = React.memo(function CardDocsPopup({
  children, 
  documentation,
  open, 
  setOpen,
  loading = false
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogContent className="sm:max-w-7xl max-h-[60vh] rounded-2xl p-0 m-0">
          <DialogHeader className="hidden">
            <DialogTitle>Documentação do relatório</DialogTitle>
          </DialogHeader>

            <Box 
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                height: '100%',
                minHeight: '500px',
                maxHeight: '65vh',
                p: 0,
                overflow: "hidden",
              }}
            >
              <Box 
                sx={{
                  width: { xs: '100%', lg: '60%' },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box 
                  sx={{
                    flex: 1,
                    // borderBottom: { xs: 1, lg: 0 },
                    // borderRight: { xs: 0, lg: 1 },
                    // borderColor: 'divider',
                    borderRight: "1px solid",
                    borderRightColor: "divider",
                    // borderBottom: "none",
                    // borderRight: "none",
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ height: '100%', overflow: 'auto' }}>
                    <Box sx={{ p: 2, '& > * + *': { mt: 2 } }}>
                      {children}
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Right Column - 40% width */}
              <Box 
                sx={{
                  // width: { xs: '40%', lg: '40%' },
                  width: "40%",
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: "hidden",
                  // height: "60vh",
                }}
              >
                <Box 
                  sx={{ 
                    flex: 1, 
                    height: '100%', 
                    overflow: "hidden", 
                    color: "text.primary",
                    // height: "60vh",
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      fontWeight: 'bold',
                      mb: 2,
                    },
                    '& p': {
                      mb: 2,
                      lineHeight: 1.6,
                    },
                    '& ul, & ol': {
                      listStyleType: 'disc',
                      pl: 3,
                      mb: 2,
                    },
                    '& li': {
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 1,
                      '& p': {
                        margin: 0,
                      },
                      '&::marker': {
                        color: 'text.primary',
                      },
                    },
                  }}
                >
                  <div className="h-full w-full max-h-[60vh] overflow-hidden" style={{ height: "100%", display: "block" }}>
                    <ScrollArea className="h-full w-full px-6 prose prose-violet" style={{ display: "block" }}>
                      <div style={{ display: "block", minWidth: "auto" }}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                          Documentação do relatório
                        </h3>
                        <div style={{ display: "block", minWidth: "auto", width: "100%" }}>
                          {documentation}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </Box>
              </Box>
            </Box>
        </DialogContent>
      </form>
    </Dialog>
  )
});

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
import React, { useState } from "react"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { SuggestionsEditor } from "@repo/design_system_mui"


export type Props = {
  children: React.ReactNode, 
  open: boolean, 
  setOpen: (open: boolean) => void,
  onSubmit: (content: string, category: "suggestion" | "doubt") => void,
  loading?: boolean
}

export const SuggestionsPopup = React.memo(function SuggestionsPopup({
  children, 
  open, 
  setOpen,
  onSubmit,
  loading
}: Props) {
  const [activeTab, setActiveTab] = useState("questions");

  const handleSubmit = (content: string) => {
    const category = activeTab === "questions" ? "doubt" : "suggestion";
    onSubmit(content, category);
    setOpen(false);
  };

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
                  {/* <Box sx={{ height: '100%', overflow: "hidden" }}> */}
                  <div className="h-full w-full max-h-[60vh] overflow-hidden p-6" style={{ height: "100%"}}>
                    <ScrollArea className="h-full w-full prose prose-violet">

                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                        Dúvidas e Sugestões
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Se tiver alguma dúvida ou sugestão, por favor, preencha o formulário abaixo.
                      </p>
                      <Tabs defaultValue="questions" onValueChange={setActiveTab}>
                        <TabsList className="w-[60px]">
                          <TabsTrigger value="questions" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950 text-xs">
                            Dúvidas
                          </TabsTrigger>
                          <TabsTrigger value="suggestions" className="dark:data-[state=active]:border-gray-950 dark:data-[state=active]:bg-gray-950  text-xs">
                            Sugestões
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="questions">
                          <SuggestionsEditor 
                            placeholder="Escreva sua dúvida aqui..." 
                            onSubmit={handleSubmit}
                            loading={loading}
                          />
                        </TabsContent>
                        <TabsContent value="suggestions">
                          <SuggestionsEditor 
                            placeholder="Escreva sua sugestão aqui..." 
                            onSubmit={handleSubmit}
                            loading={loading}
                          />
                        </TabsContent>
                      </Tabs>
                    </ScrollArea>
                  </div>
                  {/* </Box> */}
                </Box>
              </Box>
            </Box>
        </DialogContent>
      </form>
    </Dialog>
  )
});

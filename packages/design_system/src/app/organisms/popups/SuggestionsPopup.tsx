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

            <div className="flex flex-col lg:flex-row h-full min-h-[500px] max-h-[65vh] p-0 overflow-hidden">
              <div className="w-full lg:w-[60%] h-full flex flex-col">
                <div className="flex-1 h-full overflow-hidden border-r border-border">
                  <div className="h-full overflow-auto">
                    <div className="p-2 [&>*+*]:mt-2">
                      {children}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 40% width */}
              <div className="w-[40%] h-full flex flex-col overflow-hidden">
                <div className="flex-1 h-full overflow-hidden text-foreground [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:font-bold [&>h3]:mb-2 [&>h4]:font-bold [&>h4]:mb-2 [&>h5]:font-bold [&>h5]:mb-2 [&>h6]:font-bold [&>h6]:mb-2 [&>p]:mb-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-2 [&>li]:mb-1 [&>li]:flex [&>li]:items-center [&>li]:justify-start [&>li]:gap-1 [&>li>p]:m-0 [&>li::marker]:text-foreground">
                  <div className="h-full w-full max-h-[60vh] overflow-hidden p-6">
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
                </div>
              </div>
            </div>
        </DialogContent>
      </form>
    </Dialog>
  )
});

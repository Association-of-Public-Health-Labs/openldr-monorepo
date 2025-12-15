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
        <DialogContent className="sm:max-w-7xl rounded-2xl p-0 m-0">
          <DialogHeader className="hidden">
            <DialogTitle>Documentação do relatório</DialogTitle>
          </DialogHeader>

            <div className="flex flex-col lg:flex-row h-full min-h-[500px] max-h-[65vh] p-0 overflow-hidden rounded-2xl">
              <div className="w-full lg:w-[60%] h-full flex flex-col">
                <div className="flex-1 h-full overflow-hidden border-r border-border rounded-l-2xl">
                  <div className="h-full overflow-auto rounded-l-2xl">
                    <div className="p-2 [&>*+*]:mt-2">
                      {children}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 40% width */}
              <div className="w-[40%] h-full flex flex-col overflow-hidden">
                <div className="flex-1 h-full overflow-hidden text-foreground [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:font-bold [&>h3]:mb-2 [&>h4]:font-bold [&>h4]:mb-2 [&>h5]:font-bold [&>h5]:mb-2 [&>h6]:font-bold [&>h6]:mb-2 [&>p]:mb-2 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-2 [&>li]:mb-1 [&>li]:flex [&>li]:items-center [&>li]:justify-start [&>li]:gap-1 [&>li>p]:m-0 [&>li::marker]:text-foreground">
                  <div className="h-full w-full max-h-[60vh] overflow-hidden rounded-r-2xl relative">
                    <ScrollArea className="h-full w-full px-6 prose prose-violet [&_[data-slot=scroll-area-viewport]]:rounded-r-2xl [&_[data-slot=scroll-area-scrollbar]]:pr-1 [&_[data-slot=scroll-area-scrollbar]]:rounded-r-2xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 mt-4">
                        Documentação do relatório
                      </h3>
                      {documentation}
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

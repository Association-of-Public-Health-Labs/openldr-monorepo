
import { Button } from "../../../components/ui/button"
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

export type Props = {
  children: React.ReactNode, 
  open: boolean, 
  setOpen: (open: boolean) => void,
  loading?: boolean
}

export const CardDocsPopup = React.memo(function CardDocsPopup({
  children, 
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

          <div className="p-0 m-0">
            {/* Responsive container */}
            <div className="flex flex-col lg:flex-row h-full min-h-[500px] max-h-[80vh]">
              
              {/* Left Column - 60% width */}
              <div 
                className="w-full lg:w-3/5 h-full lg:h-full flex flex-col"
              >
                <div className="flex-1 border-b lg:border-b-0 lg:border-r">
                  <div className="h-full overflow-y-auto">
                    <div className="space-y-4">
                      {children}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 40% width */}
              <div 
                className="w-full lg:w-2/5 h-full lg:h-full flex flex-col"
              >
                <div className="flex-1 p-4 lg:p-6">
                  <div className="h-full overflow-y-auto">
                    {/* Right column header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Documentação do relatório
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        This column takes 40% of the width on desktop and stacks on mobile.
                      </p>
                    </div>
                    
                    {/* Right column content */}
                    <div className="space-y-4">
                      {/* Add your right column content here */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Additional Information
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          This is where you can add additional content for the right column.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  )
});

import {SyncLoader} from "react-spinners"
import { PatientsDataTable } from "./patients-data-table"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export type Props = {
  data: any[], 
  open: boolean, 
  setOpen: (open: boolean) => void,
  loading?: boolean
}

export function PatientsDataDialog({
  data, 
  open, 
  setOpen,
  loading = false
}: Props) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogContent className="sm:max-w-7xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Dados dos Pacientes</DialogTitle>
            <DialogDescription>
              Visualize os dados dos pacientes para esta unidade sanitária.
            </DialogDescription>
          </DialogHeader>
          <div className="p-0 m-0">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <SyncLoader color="#111827" size={6} />
              </div>
            ) : (
              <PatientsDataTable data={data} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

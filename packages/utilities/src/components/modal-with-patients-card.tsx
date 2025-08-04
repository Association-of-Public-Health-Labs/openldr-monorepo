import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { DataTable } from "./data-table"

export function ModalWithPatientsCard({data}: {data: any[]}) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-7xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="p-0 m-0">
            <DataTable
              data={data}
            />
          </div>
          <DialogFooter>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

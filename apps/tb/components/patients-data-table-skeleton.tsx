import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
import { Skeleton } from "./ui/skeleton";

const columns = [
  "Nome",
  "Idade",
  "Sexo",
  "Provincia",
  "Distrito",
  "US",
  "Resultado de Xpert",
  "Tipo de Amostra",
  "Data de Colheita",
  "Data de Análise",
];

export function PatientsAdvancedDataTableSkeleton({ rows = 15 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-2 text-sm">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  <Skeleton className="h-4 w-32" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j} className="whitespace-nowrap">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-2 text-sm">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
  );
}
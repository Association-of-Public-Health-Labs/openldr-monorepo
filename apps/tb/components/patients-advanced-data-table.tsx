"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
} from "lucide-react";

// Define the shape of our data (TB patient records)
type Patient = {
  request_id: string;
  first_name: string;
  last_name: string;
  age_in_years: number;
  sex_code: string;
  province: string;
  district: string;
  health_facility: string;
  final_result: string;
  specimen_source_desc: string;
  specimen_datetime: string;
  analysis_datetime: string;
};

function getResultBadge(result: string) {
  if (!result) return <span>{result}</span>;
  const lower = result.toLowerCase();
  if (
    lower.includes("detected") ||
    lower.includes("detectado") ||
    lower.includes("traços")
  ) {
    if (lower.includes("not") || lower.includes("nao") || lower.includes("não")) {
      return (
        <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
          {result}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
        {result}
      </span>
    );
  }
  if (lower.includes("indeterminate") || lower.includes("indeterminado")) {
    return (
      <span className="inline-flex items-center rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
        {result}
      </span>
    );
  }
  if (
    lower.includes("error") ||
    lower.includes("invalid") ||
    lower.includes("invalido") ||
    lower.includes("inválido")
  ) {
    return (
      <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
        {result}
      </span>
    );
  }
  return <span>{result}</span>;
}

// Column definitions for the data table
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "first_name",
    header: "Nome",
    cell: ({ row }) =>
      `${row.original.first_name || ""} ${row.original.last_name || ""}`.trim(),
  },
  {
    accessorKey: "age_in_years",
    header: "Idade",
  },
  {
    accessorKey: "sex_code",
    header: "Sexo",
  },
  {
    accessorKey: "province",
    header: "Provincia",
  },
  {
    accessorKey: "district",
    header: "Distrito",
  },
  {
    accessorKey: "health_facility",
    header: "US",
  },
  {
    accessorKey: "final_result",
    header: "Resultado de Xpert",
    cell: ({ row }) => getResultBadge(row.original.final_result),
  },
  {
    accessorKey: "specimen_source_desc",
    header: "Tipo de Amostra",
  },
  {
    accessorKey: "specimen_datetime",
    header: "Data de Colheita",
    cell: ({ row }) => {
      if (!row.original.specimen_datetime) return "";
      const date = new Date(row.original.specimen_datetime);
      return date.toLocaleDateString("pt-BR");
    },
  },
  {
    accessorKey: "analysis_datetime",
    header: "Data de Analise",
    cell: ({ row }) => {
      if (!row.original.analysis_datetime) return "";
      const date = new Date(row.original.analysis_datetime);
      return date.toLocaleDateString("pt-BR");
    },
  },
];

interface PatientsAdvancedDataTableProps {
  data: Patient[];
  rowsPerPage?: number;
  // Server-side pagination props (optional — when provided, overrides client-side)
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function PatientsAdvancedDataTable({
  data,
  rowsPerPage = 10,
  totalCount,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PatientsAdvancedDataTableProps) {
  const isServerSide = onPageChange !== undefined && totalPages !== undefined;

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable<Patient>({
    data: data || [],
    columns,
    initialState: {
      pagination: {
        pageSize: isServerSide ? (pageSize || 50) : rowsPerPage,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Only use client-side pagination when NOT server-side
    ...(isServerSide ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    manualPagination: isServerSide,
    pageCount: isServerSide ? totalPages : undefined,
  });

  React.useEffect(() => {
    if (!isServerSide) {
      table.setPageSize(rowsPerPage);
    }
  }, [rowsPerPage, table, isServerSide]);

  // Server-side pagination state
  const ssPage = currentPage || 1;
  const ssPageSize = pageSize || 50;
  const ssTotalPages = totalPages || 0;
  const ssTotalCount = totalCount || 0;

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center py-2">
        <Input
          placeholder="Buscar paciente..."
          value={
            (table.getColumn("first_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("first_name")?.setFilterValue(event.target.value)
          }
          className="max-w-xs mr-2"
        />
        {isServerSide && ssTotalCount > 0 && (
          <span className="text-sm text-muted-foreground mr-auto">
            Total:{" "}
            <span className="text-green-400 font-medium">
              {ssTotalCount.toLocaleString("pt-BR")}
            </span>{" "}
            pacientes encontrados
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" /> Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Data table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between py-2 text-sm">
        <div className="flex items-center space-x-2">
          <span>Linhas por pagina:</span>
          <Select
            value={`${isServerSide ? ssPageSize : table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              const newSize = Number(value);
              if (isServerSide && onPageSizeChange) {
                onPageSizeChange(newSize);
              } else {
                table.setPageSize(newSize);
              }
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-1">
          {isServerSide ? (
            <>
              <span>
                Pagina {ssPage} de {ssTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(1)}
                disabled={ssPage <= 1}
              >
                <span className="sr-only">Primeira pagina</span>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssPage - 1)}
                disabled={ssPage <= 1}
              >
                <span className="sr-only">Pagina anterior</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssPage + 1)}
                disabled={ssPage >= ssTotalPages}
              >
                <span className="sr-only">Proxima pagina</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssTotalPages)}
                disabled={ssPage >= ssTotalPages}
              >
                <span className="sr-only">Ultima pagina</span>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span>
                Pagina {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primeira pagina</span>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Pagina anterior</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Proxima pagina</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ultima pagina</span>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

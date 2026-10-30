"use client";

import { formatNumber } from "@repo/design_system/lib/format-number";
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
} from "@repo/design_system/components/ui/table";
import { Input } from "@repo/design_system/components/ui/input";
import { Button } from "@repo/design_system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@repo/design_system/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/design_system/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { maskName } from "@repo/design_system/lib/mask-name";
import {
  formatDay,
  resultLabel,
  sexLabel,
  type ResultTone,
} from "../app/(dashboard)/patients/reports/patients-results-data/patient-format";

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

const TONE_CLASS: Record<ResultTone, string> = {
  detected: "bg-green-500/10 text-green-400",
  not_detected: "bg-blue-500/10 text-blue-400",
  indeterminate: "bg-yellow-500/10 text-yellow-400",
  error: "bg-red-500/10 text-red-400",
  invalid: "bg-red-500/10 text-red-400",
  other: "",
};

function ResultBadge({ result }: { result: string }) {
  const { label, tone } = resultLabel(result);
  if (tone === "other") return <span>{label}</span>;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  );
}

const fullName = (p: Patient) => `${p.first_name || ""} ${p.last_name || ""}`.trim();

// Column definitions for the data table; names are masked while `hideNames` is on.
const buildColumns = (hideNames: boolean): ColumnDef<Patient>[] => [
  {
    accessorKey: "first_name",
    header: "Nome",
    cell: ({ row }) => (hideNames ? maskName(fullName(row.original)) : fullName(row.original)),
  },
  {
    accessorKey: "age_in_years",
    header: "Idade",
  },
  {
    accessorKey: "sex_code",
    header: "Sexo",
    cell: ({ row }) => sexLabel(row.original.sex_code),
  },
  {
    accessorKey: "province",
    header: "Província",
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
    cell: ({ row }) => <ResultBadge result={row.original.final_result} />,
  },
  {
    accessorKey: "specimen_source_desc",
    header: "Tipo de Amostra",
  },
  {
    accessorKey: "specimen_datetime",
    header: "Data de Colheita",
    cell: ({ row }) => formatDay(row.original.specimen_datetime),
  },
  {
    accessorKey: "analysis_datetime",
    header: "Data de Análise",
    cell: ({ row }) => formatDay(row.original.analysis_datetime),
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
  /** Shows names as "R******N F******O" (demos); the toggle sits next to "Colunas". */
  hideNames?: boolean;
  onHideNamesChange?: (hide: boolean) => void;
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
  hideNames = false,
  onHideNamesChange,
}: PatientsAdvancedDataTableProps) {
  const columns = React.useMemo(() => buildColumns(hideNames), [hideNames]);
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
              {formatNumber(ssTotalCount)}
            </span>{" "}
            pacientes encontrados
          </span>
        )}
        {onHideNamesChange && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto mr-2 flex items-center gap-2"
            aria-pressed={hideNames}
            onClick={() => onHideNamesChange(!hideNames)}
          >
            {hideNames ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {hideNames ? "Mostrar nomes" : "Ocultar nomes"}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`${onHideNamesChange ? "" : "ml-auto "}flex items-center gap-2`}
            >
              <Settings2 className="w-4 h-4" /> Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
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
          <span>Linhas por página:</span>
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
                Página {ssPage} de {ssTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(1)}
                disabled={ssPage <= 1}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssPage - 1)}
                disabled={ssPage <= 1}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssPage + 1)}
                disabled={ssPage >= ssTotalPages}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange!(ssTotalPages)}
                disabled={ssPage >= ssTotalPages}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span>
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primeira página</span>
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Página anterior</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Próxima página</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Última página</span>
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

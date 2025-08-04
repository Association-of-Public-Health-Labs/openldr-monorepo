"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/table";
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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2 } from "lucide-react";

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
  // Add other fields as needed
};

// Column definitions for the data table (using TanStack Table ColumnDef)
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "first_name",
    header: "Nome",
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
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
  },
  {
    accessorKey: "specimen_source_desc",
    header: "Tipo de Amostra",
  },
  {
    accessorKey: "specimen_datetime",
    header: "Data de Colheita",
    cell: ({ row }) => {
      const date = new Date(row.original.specimen_datetime);
      return date.toLocaleDateString('pt-BR');
    },
  },
  {
    accessorKey: "analysis_datetime",
    header: "Data de Análise",
    cell: ({ row }) => {
      const date = new Date(row.original.analysis_datetime);
      return date.toLocaleDateString('pt-BR');
    },
  },
];

// DataTable component definition
export function PatientsDataTable({ data }: { data: Patient[] }) {
  // Table state for sorting, filtering, and column visibility
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // Initialize table instance with TanStack useReactTable
  const table = useReactTable<Patient>({
    data: data || [],
    columns,
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
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fullName: (row, value) => {
        const fullName = `${row.original.first_name} ${row.original.last_name}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      },
    },
  });

  return (
    <div className="w-full"> {/* Container padding as needed */}
      {/* Filters and column toggle toolbar */}
      <div className="flex items-center py-2">
        {/* Search filter: filters by patient name */}
        <Input
          placeholder="Buscar paciente..."
          value={(table.getColumn("first_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("first_name")?.setFilterValue(event.target.value)}
          className="max-w-xs mr-2"
        />
        {/* Column visibility toggle menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
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
          <span>Rows per page:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-1">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button 
            variant="outline" size="sm" 
            onClick={() => table.setPageIndex(0)} 
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" size="sm" 
            onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

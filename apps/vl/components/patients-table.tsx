"use client";

import { PATIENT_HEADERS, patientToRow, type PatientRow } from "@/lib/vl/patients";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export function PatientsTable({ rows }: { rows: PatientRow[] }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {PATIENT_HEADERS.map((h) => (
              <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.request_id}>
              {patientToRow(row).map((cell, i) => (
                <TableCell key={PATIENT_HEADERS[i]} className="whitespace-nowrap">{cell ?? ""}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

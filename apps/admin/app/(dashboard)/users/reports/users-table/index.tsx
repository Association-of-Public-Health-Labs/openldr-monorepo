"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Ban, CircleCheck, Mail, Plus } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { Card } from "@repo/design_system/components/ui/card";
import { Input } from "@repo/design_system/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design_system/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/design_system/components/ui/table";
import type { DashboardId } from "@repo/design_system/dashboards";
import { filterRows, type UserRow, type UserStatus } from "@/lib/admin/users";
import { listUsers } from "../../actions";
import UserPanel, { type PanelTarget } from "../user-panel";
import { DASHBOARD_OPTIONS } from "../user-panel/form";

const PAGE_SIZE = 25;
const LOAD_ERROR = "Não foi possível carregar os utilizadores.";
const ALL = "all";

const STATUS: Record<UserStatus, { label: string; Icon: typeof Mail; tone: string }> = {
  active: { label: "Activo", Icon: CircleCheck, tone: "bg-[rgba(34,197,94,0.16)] text-[#118D57] dark:text-[#77ED8B]" },
  blocked: { label: "Bloqueado", Icon: Ban, tone: "bg-[rgba(255,86,48,0.16)] text-[#B71D18] dark:text-[#FFAC82]" },
  invited: { label: "Convite pendente", Icon: Mail, tone: "bg-[rgba(255,171,0,0.16)] text-[#8A5A00] dark:text-[#FFD666]" },
};

const HEAD = "bg-[#F4F6F8] px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#637381] first:rounded-l-lg last:rounded-r-lg dark:bg-[#28323D] dark:text-[#919EAB]";
const CELL = "border-b border-dashed border-[rgba(145,158,171,0.2)] px-3 py-2.5 whitespace-nowrap";

const dateFormat = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
const tagFor = (id: DashboardId) => DASHBOARD_OPTIONS.find((o) => o.id === id)?.tag;

export default function UsersTable() {
  const { user } = useUser();
  const [rows, setRows] = useState<UserRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [dashboard, setDashboard] = useState<string>(ALL);
  const [patients, setPatients] = useState<string>(ALL);
  const [page, setPage] = useState(0);
  // `open` is separate from `target` so the panel keeps its content while it slides out.
  const [target, setTarget] = useState<PanelTarget>({ kind: "new" });
  const [open, setOpen] = useState(false);
  const latest = useRef(0);
  // /users?user=<id> (the usage page's links) opens that user's panel once; an unknown id just shows the list.
  const wanted = useSearchParams().get("user");
  const openedFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    const mine = ++latest.current;
    setLoadError(false);
    try {
      const result = await listUsers();
      if (mine === latest.current) setRows(result);
    } catch {
      if (mine === latest.current) setLoadError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!wanted || !rows || openedFor.current === wanted) return;
    openedFor.current = wanted;
    if (rows.some((r) => r.id === wanted)) {
      setTarget({ kind: "edit", id: wanted });
      setOpen(true);
    }
  }, [wanted, rows]);

  const filtered = useMemo(
    () =>
      filterRows(rows ?? [], {
        search,
        status: status === ALL ? undefined : (status as UserStatus),
        dashboard: dashboard === ALL ? undefined : (dashboard as DashboardId),
        patientData: patients === ALL ? undefined : patients === "yes",
      }),
    [rows, search, status, dashboard, patients],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const panelRow = target.kind === "edit" ? (rows?.find((r) => r.id === target.id) ?? null) : null;

  function show(next: PanelTarget) {
    setTarget(next);
    setOpen(true);
  }

  // Filters reset to the first page.
  const onFilter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Utilizadores</h1>
        <Button onClick={() => show({ kind: "new" })}>
          <Plus aria-hidden /> Novo utilizador
        </Button>
      </div>

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap gap-2 p-3">
          <Input
            aria-label="Pesquisar por nome ou email"
            placeholder="Pesquisar por nome ou email"
            className="min-w-40 flex-1"
            value={search}
            onChange={(e) => onFilter(setSearch)(e.target.value)}
          />
          <Filter label="Estado" value={status} onChange={onFilter(setStatus)} options={[[ALL, "Todos os estados"], ["active", "Activo"], ["invited", "Convite pendente"], ["blocked", "Bloqueado"]]} />
          <Filter label="Dashboard" value={dashboard} onChange={onFilter(setDashboard)} options={[[ALL, "Todos os dashboards"], ...DASHBOARD_OPTIONS.map((o): [string, string] => [o.id, o.label])]} />
          <Filter label="Dados de pacientes" value={patients} onChange={onFilter(setPatients)} options={[[ALL, "Dados de pacientes"], ["yes", "Com acesso"], ["no", "Sem acesso"]]} />
        </div>

        {loadError ? (
          <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm">{LOAD_ERROR}</p>
            <Button onClick={() => void load()}>Tentar novamente</Button>
          </div>
        ) : rows === null ? (
          <p role="status" className="text-muted-foreground p-8 text-center text-sm">A carregar utilizadores…</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  {["Nome", "Dashboards", "Pacientes", "Estado", "Último acesso"].map((h) => (
                    <TableHead key={h} className={HEAD}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((r) => (
                  <UserTableRow key={r.id} row={r} onOpen={() => show({ kind: "edit", id: r.id })} />
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">Nenhum utilizador encontrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-3 p-3 text-xs">
              <span>
                {filtered.length === 0 ? "0" : `${current * PAGE_SIZE + 1}–${current * PAGE_SIZE + visible.length}`} de {filtered.length}
              </span>
              <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>Anterior</Button>
              <Button variant="outline" size="sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>Seguinte</Button>
            </div>
          </>
        )}
      </Card>

      <UserPanel
        open={open && (target.kind === "new" || panelRow !== null)}
        row={panelRow}
        currentUserId={user?.id ?? null}
        onOpenChange={setOpen}
        onChanged={() => void load()}
      />
    </div>
  );
}

function UserTableRow({ row, onOpen }: { row: UserRow; onOpen: () => void }) {
  const { label, Icon, tone } = STATUS[row.status];
  const name = `${row.firstName} ${row.lastName}`.trim();
  return (
    <TableRow className="cursor-pointer hover:bg-[rgba(145,158,171,0.04)]" onClick={onOpen}>
      <TableCell className={CELL}>
        <button type="button" className="focus-visible:ring-ring/50 rounded text-left font-semibold outline-none focus-visible:ring-[3px]" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          {name || "Sem nome"}
        </button>
        <span className="text-muted-foreground block text-xs">{row.email}</span>
      </TableCell>
      <TableCell className={CELL}>
        {row.access.dashboards.length === 0 ? (
          <span className="text-muted-foreground">–</span>
        ) : (
          row.access.dashboards.map((d) => (
            <span key={d} className="mr-1 inline-block rounded-md bg-[#F4F6F8] px-1.5 py-px text-[11px] font-semibold text-[#454F5B] dark:bg-[#28323D] dark:text-[#C4CDD5]">{tagFor(d) ?? d}</span>
          ))
        )}
      </TableCell>
      <TableCell className={CELL}>{row.access.patientData ? "Sim" : "Não"}</TableCell>
      <TableCell className={CELL}>
        <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-bold ${tone}`}>
          <Icon aria-hidden className="size-3.5" /> {label}
        </span>
      </TableCell>
      <TableCell className={CELL}>{row.lastActiveAt ? dateFormat.format(row.lastActiveAt) : "–"}</TableCell>
    </TableRow>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="min-w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([v, text]) => (
          <SelectItem key={v} value={v}>{text}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

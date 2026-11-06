"use client";

import { useState } from "react";
import { Button } from "@repo/design_system/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/design_system/components/ui/dialog";
import { Input } from "@repo/design_system/components/ui/input";
import { Label } from "@repo/design_system/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@repo/design_system/components/ui/sheet";
import { Switch } from "@repo/design_system/components/ui/switch";
import type { DashboardId } from "@repo/design_system/dashboards";
import { inviteUser, resendInvitation, revokeInvitation, setBlocked, updateUser } from "../../actions";
import type { ActionResult, UserRow } from "@/lib/admin/users";
import { DASHBOARD_OPTIONS, validateUserForm } from "./form";

/** What the panel shows: an existing row, or a blank form for a new invitation. Set from outside to open it. */
export type PanelTarget = { kind: "new" } | { kind: "edit"; id: string };

const GENERIC_ERROR = "Não foi possível concluir a operação. Tente novamente.";

type Confirm = "block" | "unblock" | "revoke";

const CONFIRM_TEXT: Record<Confirm, { title: string; body: string; button: string }> = {
  block: { title: "Bloquear utilizador", body: "O utilizador deixa de poder entrar. Pode desbloquear mais tarde.", button: "Bloquear" },
  unblock: { title: "Desbloquear utilizador", body: "O utilizador volta a poder entrar.", button: "Desbloquear" },
  revoke: { title: "Revogar convite", body: "O convite deixa de funcionar. Pode enviar um novo convite mais tarde.", button: "Revogar convite" },
};

interface PanelProps {
  open: boolean;
  /** The row being edited; null for a new invitation. */
  row: UserRow | null;
  currentUserId: string | null;
  onOpenChange: (open: boolean) => void;
  /** Called after any successful action, so the list can reload. */
  onChanged: () => void;
}

export default function UserPanel({ open, row, currentUserId, onOpenChange, onChanged }: PanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        {/* Keyed so the form state starts fresh for each user (SheetContent unmounts on close). */}
        <PanelBody key={row?.id ?? "new"} row={row} currentUserId={currentUserId} onClose={() => onOpenChange(false)} onChanged={onChanged} />
      </SheetContent>
    </Sheet>
  );
}

function PanelBody({ row, currentUserId, onClose, onChanged }: Omit<PanelProps, "open" | "onOpenChange"> & { onClose: () => void }) {
  const isNew = row === null;
  const isInvitation = row?.kind === "invitation";
  const isSelf = row !== null && row.kind === "user" && row.id === currentUserId;
  const isBlocked = row?.status === "blocked";

  const [firstName, setFirstName] = useState(row?.firstName ?? "");
  const [lastName, setLastName] = useState(row?.lastName ?? "");
  const [email, setEmail] = useState(row?.email ?? "");
  const [dashboards, setDashboards] = useState<DashboardId[]>(row?.access.dashboards ?? []);
  const [patientData, setPatientData] = useState(row?.access.patientData ?? false);
  const [admin, setAdmin] = useState(row?.access.admin ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  // The server stays the authority; these only stop the obvious self-lockout in the UI.
  const lockAdmin = isSelf && row.access.admin;

  async function run(action: () => Promise<ActionResult>) {
    setBusy(true);
    setError(null);
    setWarning(null);
    let result: ActionResult;
    try {
      result = await action();
    } catch {
      result = { ok: false, message: GENERIC_ERROR };
    }
    setBusy(false);
    setConfirm(null);
    if ("message" in result) {
      setError(result.message);
    } else {
      onChanged();
      // The change is done; with an audit warning the panel stays open so it is read, not lost.
      if (result.warning) setWarning(result.warning);
      else onClose();
    }
  }

  function save() {
    const found = validateUserForm({ firstName, lastName, email });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const input = { firstName, lastName, email, access: { dashboards, patientData, admin } };
    void run(() => (isNew ? inviteUser(input) : updateUser(row.id, input)));
  }

  function toggleDashboard(id: DashboardId, on: boolean) {
    setDashboards((prev) => (on ? [...prev.filter((d) => d !== id), id] : prev.filter((d) => d !== id)));
  }

  function confirmed() {
    if (!row || !confirm) return;
    if (confirm === "revoke") void run(() => revokeInvitation(row.id));
    else void run(() => setBlocked(row.id, confirm === "block"));
  }

  const readOnly = isInvitation || busy;
  const title = isNew ? "Novo utilizador" : isInvitation ? "Convite pendente" : "Editar utilizador";

  return (
    <>
      <SheetHeader className="border-b border-dashed">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription className="sr-only">{title}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-3 overflow-y-auto px-4">
        <Field id="user-first" label="Nome" error={errors.firstName}>
          <Input id="user-first" value={firstName} disabled={readOnly} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "user-first-error" : undefined} onChange={(e) => setFirstName(e.target.value)} />
        </Field>
        <Field id="user-last" label="Apelido" error={errors.lastName}>
          <Input id="user-last" value={lastName} disabled={readOnly} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "user-last-error" : undefined} onChange={(e) => setLastName(e.target.value)} />
        </Field>
        <Field id="user-email" label="E-mail" error={errors.email}>
          <Input id="user-email" type="email" value={email} disabled={readOnly} aria-invalid={!!errors.email} aria-describedby={errors.email ? "user-email-error" : undefined} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <Section title="Acesso aos dashboards">
          {DASHBOARD_OPTIONS.map((o) => (
            <Toggle key={o.id} label={o.label} checked={dashboards.includes(o.id)} disabled={readOnly} onChange={(on) => toggleDashboard(o.id, on)} />
          ))}
        </Section>
        <Section title="Permissões">
          <Toggle label="Dados de pacientes" hint="Nomes e registos de pacientes" checked={patientData} disabled={readOnly} onChange={setPatientData} />
          <Toggle
            label="Administrador"
            hint={lockAdmin ? "Não pode remover o seu próprio acesso de administrador." : "Acesso a este painel"}
            checked={admin}
            disabled={readOnly || lockAdmin}
            onChange={setAdmin}
          />
        </Section>

        {isInvitation && <p className="text-muted-foreground text-sm">O convite ainda não foi aceite. Os dados só podem ser alterados depois de o utilizador entrar; pode reenviar ou revogar o convite.</p>}
        {warning && (
          <p role="alert" className="rounded-md bg-[rgba(255,171,0,0.16)] p-2 text-sm font-medium text-[#8A5A00] dark:text-[#FFD666]">
            {warning}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium text-[#B71D18] dark:text-[#FFAC82]">
            {error}
          </p>
        )}
      </div>

      <SheetFooter className="border-t border-dashed">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {isInvitation ? (
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy} onClick={() => void run(() => resendInvitation(row.id))}>Reenviar convite</Button>
              <Button variant="outline" disabled={busy} className="text-[#B71D18] dark:text-[#FFAC82]" onClick={() => setConfirm("revoke")}>Revogar convite</Button>
            </div>
          ) : !isNew ? (
            <Button
              variant="outline"
              disabled={busy || (isSelf && !isBlocked)}
              title={isSelf ? "Não pode bloquear a sua própria conta." : undefined}
              className="text-[#B71D18] dark:text-[#FFAC82]"
              onClick={() => setConfirm(isBlocked ? "unblock" : "block")}
            >
              {isBlocked ? "Desbloquear" : "Bloquear"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={onClose}>{warning ? "Fechar" : "Cancelar"}</Button>
            {!isInvitation && !warning && <Button disabled={busy} onClick={save}>{isNew ? "Enviar convite" : "Guardar"}</Button>}
          </div>
        </div>
      </SheetFooter>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && !busy && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm && CONFIRM_TEXT[confirm].title}</DialogTitle>
            <DialogDescription>
              {row && `${row.firstName} ${row.lastName}`.trim()} ({row?.email}). {confirm && CONFIRM_TEXT[confirm].body}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setConfirm(null)}>Cancelar</Button>
            <Button variant={confirm === "unblock" ? "default" : "destructive"} disabled={busy} onClick={confirmed}>{confirm && CONFIRM_TEXT[confirm].button}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p id={`${id}-error`} className="text-xs text-[#B71D18] dark:text-[#FFAC82]">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-dashed pt-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({ label, hint, checked, disabled, onChange }: { label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-sm">
        {label}
        {hint && <small className="text-muted-foreground block text-xs">{hint}</small>}
      </span>
      <Switch aria-label={label} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

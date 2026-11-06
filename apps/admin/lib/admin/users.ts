import { parseAccess, type UserAccess } from "@repo/design_system/lib/access";
import type { DashboardId } from "@repo/design_system/dashboards";

export type UserStatus = "active" | "invited" | "blocked";

export interface UserRow {
  kind: "user" | "invitation";
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  access: UserAccess;
  status: UserStatus;
  lastActiveAt: number | null;
}

/** The parts of Clerk's User / Invitation that this module reads (keeps these helpers testable without the SDK). */
export interface ClerkUserLike {
  id: string;
  firstName: string | null;
  lastName: string | null;
  banned: boolean;
  lastActiveAt: number | null;
  primaryEmailAddressId: string | null;
  emailAddresses: { id: string; emailAddress: string }[];
  publicMetadata: unknown;
}
export interface ClerkInvitationLike {
  id: string;
  emailAddress: string;
  publicMetadata: Record<string, unknown> | null;
}

const NO_ACCESS: UserAccess = { dashboards: [], patientData: false, admin: false };

export function primaryEmail(user: Pick<ClerkUserLike, "primaryEmailAddressId" | "emailAddresses">): string {
  const found = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ?? user.emailAddresses[0];
  return found?.emailAddress ?? "";
}

export function isActiveAdmin(user: Pick<ClerkUserLike, "banned" | "publicMetadata">): boolean {
  return !user.banned && parseAccess(user.publicMetadata)?.admin === true;
}

/** Blocked admins cannot sign in, so they do not count. */
export function countActiveAdmins(users: Pick<ClerkUserLike, "banned" | "publicMetadata">[]): number {
  return users.filter(isActiveAdmin).length;
}

export interface InvitedName {
  firstName: string;
  lastName: string;
}

export function readInvitedName(metadata: Record<string, unknown> | null): InvitedName {
  const raw = metadata?.invitedName as Record<string, unknown> | undefined;
  return {
    firstName: typeof raw?.firstName === "string" ? raw.firstName : "",
    lastName: typeof raw?.lastName === "string" ? raw.lastName : "",
  };
}

function userRow(u: ClerkUserLike): UserRow {
  return {
    kind: "user",
    id: u.id,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: primaryEmail(u),
    access: parseAccess(u.publicMetadata) ?? NO_ACCESS,
    status: u.banned ? "blocked" : "active",
    lastActiveAt: u.lastActiveAt,
  };
}

function invitationRow(i: ClerkInvitationLike): UserRow {
  return {
    kind: "invitation",
    id: i.id,
    ...readInvitedName(i.publicMetadata),
    email: i.emailAddress,
    access: parseAccess(i.publicMetadata) ?? NO_ACCESS,
    status: "invited",
    lastActiveAt: null,
  };
}

const collator = new Intl.Collator("pt", { sensitivity: "base" });

export function mergeRows(users: ClerkUserLike[], invitations: ClerkInvitationLike[]): UserRow[] {
  return [...users.map(userRow), ...invitations.map(invitationRow)].sort(
    (a, b) => collator.compare(a.lastName, b.lastName) || collator.compare(a.firstName, b.firstName),
  );
}

export interface RowFilters {
  search?: string;
  status?: UserStatus;
  dashboard?: DashboardId;
  patientData?: boolean;
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterRows(rows: UserRow[], f: RowFilters): UserRow[] {
  const q = f.search ? fold(f.search.trim()) : "";
  return rows.filter((r) => {
    if (q && !fold(`${r.firstName} ${r.lastName} ${r.email}`).includes(q)) return false;
    if (f.status && r.status !== f.status) return false;
    if (f.dashboard && !r.access.dashboards.includes(f.dashboard)) return false;
    if (f.patientData !== undefined && r.access.patientData !== f.patientData) return false;
    return true;
  });
}

export interface GuardInput {
  actorId: string;
  targetId: string;
  /** Whether the target counts as an active admin today (an admin who is already blocked does not). */
  targetIsAdmin: boolean;
  /** Admin flag the target will have after the change. */
  nextAdmin: boolean;
  /** True when the change blocks the target. */
  blocking: boolean;
  /** Active (non-blocked) admins today, from a fresh list. */
  adminCount: number;
}

/** A Portuguese refusal message, or null when the change may go ahead. */
export function guardChange(i: GuardInput): string | null {
  const self = i.actorId === i.targetId;
  if (self && i.blocking) return "Não pode bloquear a sua própria conta.";
  if (self && i.targetIsAdmin && !i.nextAdmin) return "Não pode remover o seu próprio acesso de administrador.";
  if (i.targetIsAdmin && (i.blocking || !i.nextAdmin) && i.adminCount <= 1) {
    return "Não pode remover nem bloquear o último administrador activo.";
  }
  return null;
}

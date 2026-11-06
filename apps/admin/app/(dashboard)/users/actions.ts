"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getDashboard } from "@repo/design_system/dashboards";
import type { UserAccess } from "@repo/design_system/lib/access";
import { recordAudit } from "@/lib/admin/audit";
import { clerkErrorMessage } from "@/lib/admin/clerk-errors";
import { NotAdminError, requireAdmin } from "@/lib/admin/server-auth";
import { countInactiveUsers, type ResolvedUsers } from "@/lib/admin/usage";
import {
  countActiveAdmins, guardChange, isActiveAdmin, mergeRows, primaryEmail, readInvitedName,
  validateUserInput, type ActionResult, type ClerkInvitationLike, type ClerkUserLike, type UserRow,
} from "@/lib/admin/users";

type Client = Awaited<ReturnType<typeof clerkClient>>;

const NOT_ADMIN = "Acesso restrito a administradores.";
const NOT_FOUND = "O registo já não existe. Actualize a lista.";
const PAGE = 500;

const fail = (message: string): ActionResult => ({ ok: false, message });
const accessKeys = (a: UserAccess) => ({ dashboards: a.dashboards, patientData: a.patientData, admin: a.admin });

/** Maps any failure to a Portuguese result; Clerk's own text never reaches the client. */
function failure(error: unknown): ActionResult {
  if (error instanceof NotAdminError) return fail(NOT_ADMIN);
  console.error("[admin] action failed", error);
  return fail(clerkErrorMessage(error));
}

async function allUsers(client: Client): Promise<ClerkUserLike[]> {
  const users: ClerkUserLike[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, totalCount } = await client.users.getUserList({ limit: PAGE, offset });
    users.push(...data);
    if (data.length < PAGE || users.length >= totalCount) return users;
  }
}

async function pendingInvitations(client: Client): Promise<ClerkInvitationLike[]> {
  const found: ClerkInvitationLike[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, totalCount } = await client.invitations.getInvitationList({ status: "pending", limit: PAGE, offset });
    found.push(...data);
    if (data.length < PAGE || found.length >= totalCount) return found;
  }
}

const redirectUrl = () => `${getDashboard("admin").url}/accept-invite`;

function invitationMetadata(firstName: string, lastName: string, access: UserAccess) {
  return { ...accessKeys(access), invitedName: { firstName, lastName } };
}

export async function listUsers(): Promise<UserRow[]> {
  await requireAdmin();
  const client = await clerkClient();
  const [users, invitations] = await Promise.all([allUsers(client), pendingInvitations(client)]);
  return mergeRows(users, invitations);
}

export async function inviteUser(raw: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const checked = validateUserInput(raw);
    if ("message" in checked) return fail(checked.message);
    const input = checked.value;
    const client = await clerkClient();
    const email = input.email;
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: invitationMetadata(input.firstName, input.lastName, input.access),
      redirectUrl: redirectUrl(),
    });
    await recordAudit({
      action: "user_invite",
      target_user_id: invitation.id,
      changes: { old: null, new: { email, firstName: input.firstName, lastName: input.lastName, ...accessKeys(input.access) } },
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function updateUser(id: string, raw: unknown): Promise<ActionResult> {
  let applied: Record<string, unknown> = {};
  let before: Record<string, unknown> = {};
  let actorId = "";
  try {
    const admin = await requireAdmin();
    actorId = admin.userId;
    if (typeof id !== "string" || !id) return fail("Dados inválidos. Verifique o formulário e tente novamente.");
    const checked = validateUserInput(raw);
    if ("message" in checked) return fail(checked.message);
    const input = checked.value;
    const client = await clerkClient();
    const users = await allUsers(client);
    const target = users.find((u) => u.id === id);
    if (!target) return fail(NOT_FOUND);

    const refusal = guardChange({
      actorId, targetId: id, targetIsAdmin: isActiveAdmin(target), nextAdmin: input.access.admin,
      blocking: false, adminCount: countActiveAdmins(users),
    });
    if (refusal) return fail(refusal);

    const { firstName, lastName, email } = input;
    const oldEmail = primaryEmail(target);
    const oldAccess = target.publicMetadata as Partial<UserAccess> | null;
    before = {
      firstName: target.firstName, lastName: target.lastName, email: oldEmail,
      dashboards: oldAccess?.dashboards ?? [], patientData: oldAccess?.patientData ?? false, admin: oldAccess?.admin ?? false,
    };

    // Email first: if creating the new address fails, nothing else has changed.
    if (email.toLowerCase() !== oldEmail.toLowerCase()) {
      await client.emailAddresses.createEmailAddress({ userId: id, emailAddress: email, primary: true, verified: true });
      applied.email = email;
      const oldIds = target.emailAddresses.filter((e) => e.id === target.primaryEmailAddressId).map((e) => e.id);
      for (const emailId of oldIds) await client.emailAddresses.deleteEmailAddress(emailId);
    }
    if (firstName !== (target.firstName ?? "") || lastName !== (target.lastName ?? "")) {
      await client.users.updateUser(id, { firstName, lastName });
      applied = { ...applied, firstName, lastName };
    }
    await client.users.updateUserMetadata(id, { publicMetadata: accessKeys(input.access) });
    applied = { ...applied, ...accessKeys(input.access) };

    await recordAudit({ action: "user_update", target_user_id: id, changes: { old: before, new: applied } });
    return { ok: true };
  } catch (error) {
    // A step after the first write failed: record what did change.
    if (Object.keys(applied).length > 0) {
      await recordAudit({ action: "user_update", target_user_id: id, changes: { old: before, new: applied, partial: true } });
    }
    return failure(error);
  }
}

export async function setBlocked(id: string, blocked: boolean): Promise<ActionResult> {
  try {
    const { userId } = await requireAdmin();
    if (typeof id !== "string" || !id || typeof blocked !== "boolean") return fail("Dados inválidos. Verifique o formulário e tente novamente.");
    const client = await clerkClient();
    const users = await allUsers(client);
    const target = users.find((u) => u.id === id);
    if (!target) return fail(NOT_FOUND);

    const isAdmin = isActiveAdmin(target);
    const refusal = guardChange({
      actorId: userId, targetId: id, targetIsAdmin: isAdmin, nextAdmin: isAdmin,
      blocking: blocked, adminCount: countActiveAdmins(users),
    });
    if (refusal) return fail(refusal);

    if (blocked) await client.users.banUser(id);
    else await client.users.unbanUser(id);
    await recordAudit({
      action: blocked ? "user_block" : "user_unblock",
      target_user_id: id,
      changes: { old: { blocked: target.banned }, new: { blocked } },
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

async function findPending(client: Client, id: string): Promise<ClerkInvitationLike | undefined> {
  return (await pendingInvitations(client)).find((i) => i.id === id);
}

const RESEND_LOST = "O convite anterior foi cancelado mas o novo não foi criado. Crie o convite novamente.";

export async function resendInvitation(id: string): Promise<ActionResult> {
  let old: ClerkInvitationLike | undefined;
  let revoked = false;
  try {
    await requireAdmin();
    const client = await clerkClient();
    old = await findPending(client, id);
    if (!old) return fail(NOT_FOUND);
    const name = readInvitedName(old.publicMetadata);

    await client.invitations.revokeInvitation(id);
    revoked = true;
    const fresh = await client.invitations.createInvitation({
      emailAddress: old.emailAddress,
      publicMetadata: { ...(old.publicMetadata ?? {}), invitedName: name },
      redirectUrl: redirectUrl(),
    });
    await recordAudit({
      action: "invitation_resend",
      target_user_id: fresh.id,
      changes: { old: { invitationId: id }, new: { invitationId: fresh.id, email: old.emailAddress } },
    });
    return { ok: true };
  } catch (error) {
    if (revoked && old) {
      console.error("[admin] resend failed after revoke", error);
      await recordAudit({
        action: "invitation_resend",
        target_user_id: id,
        changes: { old: { invitationId: id, email: old.emailAddress, publicMetadata: old.publicMetadata }, new: null, partial: true },
      });
      return fail(RESEND_LOST);
    }
    return failure(error);
  }
}

export async function revokeInvitation(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const client = await clerkClient();
    const old = await findPending(client, id);
    if (!old) return fail(NOT_FOUND);
    await client.invitations.revokeInvitation(id);
    await recordAudit({
      action: "invitation_revoke",
      target_user_id: id,
      changes: { old: { email: old.emailAddress, status: "pending" }, new: { status: "revoked" } },
    });
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

const MAX_RESOLVE = 100;

/** Names and emails for user ids (the usage reports only carry ids). Ids Clerk no longer knows are left out. */
export async function resolveUsers(ids: string[]): Promise<ResolvedUsers> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length > MAX_RESOLVE || ids.some((id) => typeof id !== "string" || !id)) {
    throw new Error("Pedido inválido.");
  }
  const unique = [...new Set(ids)];
  if (unique.length === 0) return {};
  const client = await clerkClient();
  const { data } = await client.users.getUserList({ userId: unique, limit: MAX_RESOLVE });
  return Object.fromEntries(
    data.map((u) => [u.id, { name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(), email: primaryEmail(u) }]),
  );
}

/** Active users who have not been seen for `days` days (Clerk's last_active_at; never signed in counts). */
export async function countInactive(days = 90): Promise<number> {
  await requireAdmin();
  if (!Number.isFinite(days) || days < 1) throw new Error("Pedido inválido.");
  return countInactiveUsers(await allUsers(await clerkClient()), days);
}

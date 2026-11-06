import { auth } from "@clerk/nextjs/server";
import { api } from "@/config/api";

export interface AuditEntry {
  /** Max 50 characters. */
  action: string;
  target_user_id: string;
  /** Old and new values. Never a password. */
  changes: Record<string, unknown>;
}

/** Records an admin action in the API. A failure is logged and never undoes the change. */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const token = await (await auth()).getToken();
    if (!token) throw new Error("no session token");
    await api(token).post("/admin/audit", entry);
  } catch (error) {
    console.error("[admin] audit log failed", entry.action, entry.target_user_id, error instanceof Error ? error.message : error);
  }
}

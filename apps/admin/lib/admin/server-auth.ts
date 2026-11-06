import { auth, clerkClient, type User } from "@clerk/nextjs/server";

export class NotAdminError extends Error {
  constructor(message = "Acesso restrito a administradores.") {
    super(message);
    this.name = "NotAdminError";
  }
}

/**
 * The signed-in caller, only if they are an admin right now.
 * Re-reads the user from Clerk instead of trusting the session token, which can be stale
 * (a demoted or banned admin keeps a valid token until it expires).
 */
export async function requireAdmin(): Promise<{ userId: string; user: User }> {
  const { userId } = await auth();
  if (!userId) throw new NotAdminError();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.banned || user.publicMetadata?.admin !== true) throw new NotAdminError();
  return { userId, user };
}

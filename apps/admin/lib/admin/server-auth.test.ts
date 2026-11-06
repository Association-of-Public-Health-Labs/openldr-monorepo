import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ auth: vi.fn(), getUser: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
  clerkClient: async () => ({ users: { getUser: mocks.getUser } }),
}));

import { NotAdminError, requireAdmin } from "./server-auth";

const ADMIN = { dashboards: [], patientData: false, admin: true };

beforeEach(() => {
  mocks.auth.mockReset();
  mocks.getUser.mockReset();
});

describe("requireAdmin", () => {
  it("returns the caller when Clerk says admin and not banned", async () => {
    const user = { id: "u1", banned: false, publicMetadata: ADMIN };
    mocks.auth.mockResolvedValue({ userId: "u1" });
    mocks.getUser.mockResolvedValue(user);
    await expect(requireAdmin()).resolves.toEqual({ userId: "u1", user });
    expect(mocks.getUser).toHaveBeenCalledWith("u1");
  });
  it("refuses when signed out", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    await expect(requireAdmin()).rejects.toBeInstanceOf(NotAdminError);
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it("refuses a user whose admin flag is not exactly true", async () => {
    mocks.auth.mockResolvedValue({ userId: "u1" });
    for (const publicMetadata of [{}, { admin: true }, { ...ADMIN, admin: false }, { ...ADMIN, admin: "true" }, { ...ADMIN, admin: 1 }]) {
      mocks.getUser.mockResolvedValue({ id: "u1", banned: false, publicMetadata });
      await expect(requireAdmin()).rejects.toBeInstanceOf(NotAdminError);
    }
  });
  it("refuses a banned admin", async () => {
    mocks.auth.mockResolvedValue({ userId: "u1" });
    mocks.getUser.mockResolvedValue({ id: "u1", banned: true, publicMetadata: ADMIN });
    await expect(requireAdmin()).rejects.toBeInstanceOf(NotAdminError);
  });
});

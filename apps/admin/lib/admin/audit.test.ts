import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ getToken: vi.fn(), post: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ getToken: m.getToken }) }));
vi.mock("@/config/api", () => ({ api: () => ({ post: m.post }) }));

import { recordAudit } from "./audit";

const entry = { action: "user_block", target_user_id: "u1", changes: { old: null, new: null } };

beforeEach(() => {
  m.getToken.mockReset().mockResolvedValue("tok");
  m.post.mockReset().mockResolvedValue({ status: 201 });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("recordAudit", () => {
  it("returns true when the row was written", async () => {
    expect(await recordAudit(entry)).toBe(true);
    expect(m.post).toHaveBeenCalledWith("/admin/audit", entry);
  });
  it("returns false, without throwing, when the API call fails", async () => {
    m.post.mockRejectedValue(new Error("down"));
    expect(await recordAudit(entry)).toBe(false);
  });
  it("returns false when there is no session token", async () => {
    m.getToken.mockResolvedValue(null);
    expect(await recordAudit(entry)).toBe(false);
    expect(m.post).not.toHaveBeenCalled();
  });
});

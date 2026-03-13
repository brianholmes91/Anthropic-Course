// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = vi.hoisted(() => ({
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => mockCookieStore,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("sets the cookie named auth-token", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-123", "user@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledOnce();
  expect(mockCookieStore.set.mock.calls[0][0]).toBe("auth-token");
});

test("cookie has correct security options", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-123", "user@example.com");

  const options = mockCookieStore.set.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie expiry is approximately 7 days from now", async () => {
  const { createSession } = await import("@/lib/auth");
  const before = Date.now();
  await createSession("user-123", "user@example.com");
  const after = Date.now();

  const options = mockCookieStore.set.mock.calls[0][2];
  const expires: Date = options.expires;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("token payload contains userId and email", async () => {
  const { createSession } = await import("@/lib/auth");
  await createSession("user-456", "test@example.com");

  const token: string = mockCookieStore.set.mock.calls[0][1];
  const secret = new TextEncoder().encode("development-secret-key");
  const { payload } = await jwtVerify(token, secret);

  expect(payload.userId).toBe("user-456");
  expect(payload.email).toBe("test@example.com");
});

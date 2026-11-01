import { apiFetch, clearCsrfCache } from "@/lib/api/client";
import type { LoginInput, RegisterInput, User } from "@/types/auth";

export function registerUser(input: RegisterInput): Promise<User> {
  return apiFetch<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      displayName: input.displayName.trim(),
      password: input.password,
    }),
  });
}

export function loginUser(input: LoginInput): Promise<User> {
  return apiFetch<User>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: input.email.trim(),
      password: input.password,
    }),
  });
}

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
  return apiFetch<User>("/api/auth/me", { cache: "no-store", signal });
}

export async function logoutUser(): Promise<void> {
  await apiFetch<void>("/api/auth/logout", { method: "POST" });
  // The CSRF cookie is cleared on logout, so drop the stale cached token.
  clearCsrfCache();
}

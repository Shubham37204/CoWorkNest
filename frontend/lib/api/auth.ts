import { API_URL } from "@/lib/config";

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
}

interface CsrfResponse {
  headerName: string;
  token: string;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: "NETWORK" | "TIMEOUT",
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new AuthApiError("Request timed out", 0, "TIMEOUT");
    }
    throw new AuthApiError("Network error", 0, "NETWORK");
  }
}

async function getCsrfToken(): Promise<CsrfResponse> {
  const response = await request("/api/auth/csrf", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AuthApiError("Could not start a secure session", response.status);
  }

  const csrf: unknown = await response.json();

  if (
    typeof csrf !== "object" ||
    csrf === null ||
    !("headerName" in csrf) ||
    !("token" in csrf) ||
    typeof csrf.headerName !== "string" ||
    typeof csrf.token !== "string" ||
    !csrf.headerName ||
    !csrf.token
  ) {
    throw new AuthApiError("Invalid security token response");
  }

  return { headerName: csrf.headerName, token: csrf.token };
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const csrf = await getCsrfToken();

  const response = await request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AuthApiError("Request failed", response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

export function registerUser(data: RegisterRequest): Promise<UserResponse> {
  return postJson<UserResponse>("/api/auth/register", {
    email: data.email.trim(),
    displayName: data.displayName.trim(),
    password: data.password,
  });
}

export function loginUser(data: LoginRequest): Promise<UserResponse> {
  return postJson<UserResponse>("/api/auth/login", {
    email: data.email.trim(),
    password: data.password,
  });
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await request("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new AuthApiError("Could not fetch current user", response.status);
  }

  return (await response.json()) as UserResponse;
}

export async function logoutUser(): Promise<void> {
  await postJson<void>("/api/auth/logout");
}

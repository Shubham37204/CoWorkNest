import { API_URL } from "@/lib/config";

const REQUEST_TIMEOUT_MS = 10_000;

export type ApiErrorCode = "NETWORK" | "TIMEOUT";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string>,
    public readonly code?: ApiErrorCode,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type CsrfToken = { headerName: string; token: string };

let csrfCache: CsrfToken | null = null;

export function clearCsrfCache(): void {
  csrfCache = null;
}

async function safeFetch(path: string, init: RequestInit): Promise<Response> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;

  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "TimeoutError") {
      throw new ApiError(0, "Request timed out", undefined, "TIMEOUT");
    }
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    throw new ApiError(0, "Network error", undefined, "NETWORK");
  }
}

async function getCsrf(): Promise<CsrfToken> {
  if (!csrfCache) {
    const res = await safeFetch("/api/auth/csrf", { cache: "no-store" });
    if (!res.ok) {
      throw new ApiError(res.status, "Could not start a secure session");
    }

    const body = (await res.json().catch(() => null)) as Partial<CsrfToken> | null;
    if (!body?.headerName || !body?.token) {
      throw new ApiError(500, "Invalid security token response");
    }
    csrfCache = { headerName: body.headerName, token: body.token };
  }
  return csrfCache;
}

async function toApiError(res: Response): Promise<ApiError> {
  const raw = await res.text();
  try {
    const body = JSON.parse(raw) as {
      detail?: string;
      message?: string;
      error?: string;
      errors?: Record<string, string>;
    };
    return new ApiError(
      res.status,
      body.detail || body.message || body.error || res.statusText,
      body.errors,
    );
  } catch {
    return new ApiError(res.status, raw || res.statusText);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(method);

  const send = async (): Promise<Response> => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");

    if (mutating) {
      const { headerName, token } = await getCsrf();
      headers.set(headerName, token);
    }

    return safeFetch(path, { ...init, headers });
  };

  let res = await send();

  // Retry only when the CSRF token actually changed (cookie cleared).
  // Same token again means a real permission denial, not a CSRF problem.
  if (res.status === 403 && mutating) {
    const sentToken = csrfCache?.token;
    clearCsrfCache();
    const fresh = await getCsrf();
    if (fresh.token !== sentToken) {
      res = await send();
    }
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

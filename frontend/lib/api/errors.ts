import { ApiError } from "@/lib/api/client";

type Overrides = Partial<Record<number, string>>;

export function toUserMessage(err: unknown, overrides: Overrides = {}): string {
  if (!(err instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  const override = overrides[err.status];
  if (override) return override;

  if (err.status === 0) {
    return err.code === "TIMEOUT"
      ? "The server took too long to respond"
      : "Cannot reach the server";
  }

  switch (err.status) {
    case 400: {
      const first = err.fieldErrors && Object.values(err.fieldErrors)[0];
      return first ?? "Please check the details you entered";
    }
    case 401:
      return "Your session has expired. Please log in again";
    case 403:
      return "You don't have permission to do that";
    case 404:
      return "Not found";
    case 409:
      return err.message || "This item already exists";
    case 429:
      return "Too many attempts. Try again later";
    default:
      return err.status >= 500
        ? "Server error. Please try again later"
        : err.message || "Request failed";
  }
}

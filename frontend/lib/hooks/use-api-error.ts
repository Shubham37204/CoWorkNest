"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import { toUserMessage } from "@/lib/api/errors";

export function useApiErrorHandler() {
  const router = useRouter();

  return useCallback(
    (err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;

      if (err instanceof ApiError && err.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        router.replace("/login");
        return;
      }

      console.warn("API request failed:", err);
      toast.error(toUserMessage(err));
    },
    [router],
  );
}

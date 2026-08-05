import { useMutation } from "@tanstack/react-query";
import type { UseMutationOptions, UseMutationResult } from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JoinWaitlistRequest {
  email: string;
}

export interface JoinWaitlistResponse {
  message: string;
  email?: string;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

export const joinWaitlist = async (
  request: JoinWaitlistRequest,
  options?: Parameters<typeof customFetch>[1],
): Promise<JoinWaitlistResponse> => {
  return customFetch<JoinWaitlistResponse>("/api/waitlist", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(request),
  });
};

// ---------------------------------------------------------------------------
// React Query hook
// ---------------------------------------------------------------------------

export type JoinWaitlistMutationResult = NonNullable<Awaited<ReturnType<typeof joinWaitlist>>>;
export type JoinWaitlistMutationError = ErrorType<{ error: string }>;

export const useJoinWaitlist = <TError = JoinWaitlistMutationError, TContext = unknown>(
  options?: {
    mutation?: UseMutationOptions<
      JoinWaitlistMutationResult,
      TError,
      JoinWaitlistRequest,
      TContext
    >;
  },
): UseMutationResult<JoinWaitlistMutationResult, TError, JoinWaitlistRequest, TContext> => {
  const mutationKey = ["joinWaitlist"];
  const mutationOptions: UseMutationOptions<
    JoinWaitlistMutationResult,
    TError,
    JoinWaitlistRequest,
    TContext
  > = {
    mutationKey,
    mutationFn: (data: JoinWaitlistRequest) => joinWaitlist(data),
    ...options?.mutation,
  };
  return useMutation(mutationOptions);
};

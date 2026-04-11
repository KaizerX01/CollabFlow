import type { AxiosError } from "axios";

export interface VersionConflictPayload {
  code?: string;
  error?: string;
  resourceType?: string;
  resourceId?: string;
  expectedVersion?: number;
  currentVersion?: number;
  latest?: unknown;
}

export const isVersionConflictError = (
  error: unknown
): error is AxiosError<VersionConflictPayload> => {
  const maybeAxios = error as AxiosError<VersionConflictPayload>;
  return maybeAxios?.response?.status === 409 && maybeAxios?.response?.data?.code === "VERSION_CONFLICT";
};

export const getConflictMessage = (error: unknown, fallback: string): string => {
  if (isVersionConflictError(error)) {
    return error.response?.data?.error || "Your data is out of date. The latest server version has been applied.";
  }

  return fallback;
};

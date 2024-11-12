import { ApiResponse, RemoteData, RemoteDataWithSetter } from "@/type";
import { Dispatch, SetStateAction } from "react";
import { formatDistanceToNow } from "date-fns";

export function createErrorResponse(message: string): Response {
  const res: ApiResponse<null> = {
    data: null,
    success: false,
    message: message,
  };

  return Response.json(res);
}

export function createSuccessResponse<T>(
  data: T,
  message: string = ""
): Response {
  const res: ApiResponse<T> = {
    data,
    success: true,
    message,
  };

  return Response.json(res);
}

export function getDefaultRemoteData<T>(data: T): RemoteData<T> {
  return {
    isLoading: false,
    data,
  };
}

export function getRemoteDataWithSetter<T>(
  remoteData: RemoteData<T>,
  setter: Dispatch<SetStateAction<RemoteData<T>>>
): RemoteDataWithSetter<T> {
  return { ...remoteData, setData: setter };
}

export function setRemoteDataLoading<T>(
  setter: Dispatch<SetStateAction<RemoteData<T>>>,
  value: boolean
) {
  setter((prev) => ({ ...prev, isLoading: value }));
}

export function truncateString(str: string, maxLength: number = 25): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + "...";
}

export function excludeStartAndEnd<T>(arr: T[]) {
  const slicedArray = arr.slice(1, arr.length - 1);

  return slicedArray;
}

export function hexToRGBA(hex: string, alpha = 0.1) {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getErrorMessage(error: any) {
  let msg = "Something went wrong";

  if (error instanceof Error) msg = error.message;

  return msg;
}

export function timeSince(now: string): string {
  const nowDate = new Date(now);

  return formatDistanceToNow(nowDate, { addSuffix: true });
}

export function getInitials(name?: string): string {
  if (!name) return "U";

  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  } else {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}

export function formatToTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatOpeningHours(str: string): {
  day: string;
  period: string;
} {
  const [day, ...periodParts] = str.split(":");

  if (!day || periodParts.length === 0)
    return {
      day: "Unknown",
      period: "Unknown",
    };

  const period = periodParts.join(":").trim().replace(/\s+/g, " ");

  return { day: day.trim(), period };
}

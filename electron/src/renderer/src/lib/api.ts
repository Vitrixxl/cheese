import { treaty } from "@elysiajs/eden";
import type { App, ApiError } from "@backend";
import type { GameApi } from "@game-server";
export const api = treaty<App>("localhost:6969", {
  fetch: { credentials: "include" },
});
export type UnauthorizedError = {
  status: 401;
  value: {
    message: "Unauthorized";
  };
};

export const handleApiResponse = async <T>(
  promise: Promise<{ data: T; error: null } | { data: null; error: ApiError }>,
) => {
  const { data, error } = await promise;
  if (error) {
    if (error.status == 422) {
      console.error(error);
      throw new Error("Invalid data passed");
    } else if ("message" in (error.value as Record<string, any>)) {
      throw new Error((error.value as Record<string, any>).message);
    }
  }
  return data;
};

export const gameApi = treaty<GameApi>("localhost:3001");

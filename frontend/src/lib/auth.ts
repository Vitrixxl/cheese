import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "@backend/lib/auth";

export const auth = createAuthClient({
  baseURL: "http://localhost:6969",
  plugins: [inferAdditionalFields<Auth>()],
});

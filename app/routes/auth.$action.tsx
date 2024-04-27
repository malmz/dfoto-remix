import { logto } from "~/lib/auth/logto";

export const loader = logto.handleAuthRoutes({
  "sign-in": {
    path: "/auth/sign-in",
    redirectBackTo: "/auth/callback", // The redirect URI just entered
  },
  "sign-in-callback": {
    path: "/auth/callback",
    redirectBackTo: "/",
  },
  "sign-out": {
    path: "/auth/sign-out",
    redirectBackTo: "/",
  },
});

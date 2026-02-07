import type { SessionAuthObject } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      auth?: SessionAuthObject;
    }
  }
}

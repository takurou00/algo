import { Hono } from "hono";
import { auth } from "../lib/auth.js";

export const authRouter = new Hono();

// Better Auth handles all auth routes via its handler
authRouter.all("/*", (c) => auth.handler(c.req.raw));

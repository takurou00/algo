import { serve } from "@hono/node-server";
import { app } from "./app.js";

const port = parseInt(process.env.PORT ?? "8000");

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`MediaVault API running on http://localhost:${info.port}`);
  }
);

/**
 * Copyright (c) 2025 grakeice
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import "zx/globals";
import "dotenv/config";
import { serveStatic } from "@hono/node-server/serve-static";

console.log("---");
await $`pnpm client build`.verbose();
console.log("---");

const backend = $`uv run ./backend/main.py`.verbose();

const HOST = String(process.env.CLIENT_HOST || "127.0.0.1");
const PORT = Number(process.env.CLIENT_PORT || "3000");

const app = new Hono();
app.use(logger());

app.get("*", serveStatic({ root: "./client/dist/" }));

serve({ fetch: app.fetch, hostname: HOST, port: PORT }, (info) => {
	console.log(`App is now served on http://${info.address}:${info.port}`);
	console.log("---");
});

process.on("SIGINT", () => {
	backend.kill();
	process.exit();
});

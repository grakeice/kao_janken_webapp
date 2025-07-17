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
import { serveStatic } from "@hono/node-server/serve-static";

console.log("---");
await $`npm run client run build`.verbose();
console.log("---");


const app = new Hono();
app.use(logger());

app.get("*", serveStatic({ root: "./client/dist/" }));

serve({ fetch: app.fetch, port: 3000 }, (info) => {
	console.log(`App is now served on http://127.0.0.1:${info.port}`);
	console.log("---")
});

const backend = $`uv run ./backend/main.py`.verbose();

process.on("SIGINT", () => {
	backend.kill();
	process.exit();
});

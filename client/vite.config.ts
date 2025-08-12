import path from "node:path";

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwindcss(), react()],
	server: {
		cors: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
	envDir: "../",
});

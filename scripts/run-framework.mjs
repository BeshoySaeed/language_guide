import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readExecutionProfile } from "./execution-profile.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");
const managedLinux = readExecutionProfile() === "managed-linux";
const portableDevPort = 5173;

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(managedLinux
  ? "../node_modules/vite/bin/vite.js"
  : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!managedLinux && command === "dev" ? ["--port", String(portableDevPort)] : []), ...args];

if (!managedLinux && command === "dev") void warmPortableDevRoutes(portableDevPort);
await import(cli.href);

async function warmPortableDevRoutes(port) {
  const origin = `http://localhost:${port}`;
  const routes = [
    "/",
    "/learn?level=A1",
    "/practice",
    "/tests",
    "/review",
    "/library",
    "/offline",
    "/progress",
    "/vocabulary?level=A1",
    "/search?q=hallo",
  ];

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await delay(250);
      try {
        const response = await fetch(`${origin}/api/v1/health`);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // The dev server is still starting.
      }
    }
    if (!ready) return;

    const startedAt = Date.now();
    for (const route of routes) {
      const response = await fetch(`${origin}${route}`);
      if (!response.ok) throw new Error(`${route} returned ${response.status}`);
      await response.arrayBuffer();
    }
    console.log(`  ➜  Warmed ${routes.length} app routes in ${Date.now() - startedAt}ms`);
  } catch (error) {
    console.warn("  ⚠  Route warm-up did not finish; the app is still available.", error);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

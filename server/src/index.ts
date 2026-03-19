import "dotenv/config";
import app from "./app";
import wsManager from "./websockets/connectionManager";
import http from "http";
import { startScheduledCleanup } from "./cleanup/scheduledCleanup";
import { loadServerConfig } from "./config/serverConfig";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

wsManager.init(server);

async function startServer(): Promise<void> {
  try {
    await loadServerConfig();
  } catch (error) {
    console.error("Failed to load server configuration:", error);
    process.exit(1);
  }

  const cleanupTimer = startScheduledCleanup();

  server.listen(PORT, () => {
    console.log(`HookCatcher server listening on port ${PORT}`);
  });

  process.on("SIGTERM", () => {
    clearInterval(cleanupTimer);
    server.close(() => {
      console.log("Server shut down gracefully.");
      process.exit(0);
    });
  });
}

void startServer();

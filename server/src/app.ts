import express from "express";
import cors from "cors";
import morgan from "morgan";

import binHandler from "./handlers/binHandler";
import webhookHandler from "./handlers/webhookHandler";

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Mount API routes
app.use("/api/bins", binHandler);

// Mount webhook capture routes under the API namespace.
app.use("/api/hooks", webhookHandler);

export default app;

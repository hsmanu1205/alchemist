import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleFileUpload, handleValidation } from "./routes/data-processing";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Data processing routes
  app.post("/api/upload-files", handleFileUpload);
  app.post("/api/validate-data", handleValidation);

  return app;
}

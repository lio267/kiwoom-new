import "express-async-errors";
import "./config/env";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import stockRouter from "./routes/stock";

const app = express();

app.set("trust proxy", true);

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? true
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/stock", stockRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({
    error: "서버에서 예상치 못한 오류가 발생했습니다.",
    details: error instanceof Error ? error.message : String(error)
  });
});

const port = Number(process.env.SERVER_PORT ?? 4000);

app.listen(port, () => {
  console.log(`Kiwoom proxy server listening on port ${port}`);
});

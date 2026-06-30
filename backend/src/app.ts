import "dotenv/config"; // Safe top-level environment initialization
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { router as routes } from "./routes";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use(logger);

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;

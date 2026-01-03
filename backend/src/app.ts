import express from "express";
import cors from "cors";
import verificationRoutes from "./route/verification.route";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/verification", verificationRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected error" });
});

export default app;

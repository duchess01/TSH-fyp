import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";
import dotenv from "dotenv";
import router from "./src/routes/index.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3001;

// Use the imported routes
app.use("/api/v1", router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/api/v1`);
});

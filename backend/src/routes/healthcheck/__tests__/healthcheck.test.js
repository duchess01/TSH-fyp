import { test, expect } from "vitest";
import express from "express";
import request from "supertest";
import healthcheckRouter from "../index.js";

const app = express();
app.use("/api", healthcheckRouter);

test("GET /api/health should return status UP and a timestamp", async () => {
  const response = await request(app).get("/api/health");

  expect(response.status).toBe(201);
  expect(response.body.status).toBe("UP");
  expect(response.body.timestamp).toBeDefined();
  expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
});

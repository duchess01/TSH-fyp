import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting all users", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/getUserDetails/:id", verifyToken, async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error getting user details", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = rows[0];
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, rows[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, ...user });
  } catch (err) {
    console.error("Error logging in user", err.stack);
    res.status(500).json({ error: "Login error" });
  }
});

export default router;

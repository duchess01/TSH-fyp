import express from "express";
import { Router } from "express";
import db from "../../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM users");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error getting all users", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});

// Get user details by ID
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

// Update user by ID
router.put("/update/:id", verifyToken, async (req, res) => {
  const { name, email, role, privilege } = req.body;

  try {
    // Check if user exists
    const { rows: existingUser } = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [req.params.id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user in the database
    const updatedUser = await db.query(
      "UPDATE users SET name = $1, email = $2, role = $3, privilege = $4 WHERE id = $5 RETURNING *",
      [name, email, role, privilege, req.params.id]
    );

    res.status(200).json(updatedUser.rows[0]);
  } catch (err) {
    console.error("Error updating user", err.stack);
    res.status(500).json({ error: "Database error" });
  }
});


// User login
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const token = jwt.sign({ userId: user.id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, ...user });
  } catch (err) {
    console.error("Error logging in user", err.stack);
    res.status(500).json({ error: "Login error" });
  }
});

// Delete a user
router.delete("/delete/:id", async (req, res) => {
  try {
    const { rows } = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

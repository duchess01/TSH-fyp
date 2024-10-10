import { expect, test } from "vitest";
import supertest from "supertest";

const API_URL = process.env.API_URL || "http://localhost:3000"; // Use environment variable or default

const request = supertest(API_URL);

test("GET /users should return all users", async () => {
  const response = await request.get("/api/v1/users");

  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBe(4); //According to current db injection script of 4 users
});

let token;

beforeAll(async () => {
  const loginResponse = await request.post("/api/v1/users/login").send({
    email: "john.doe@example.com", // Use an existing user's email
    password: "Password!123", // Use the corresponding password
  });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.token).toBeDefined();
  token = loginResponse.body.token;
});

test("GET /users/getUserDetails/:id should return a specific user", async () => {
  const response = await request
    .get("/api/v1/users/getUserDetails/1")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  expect(response.body.id).toBe(1);
  expect(response.body.name).toBe("John Doe");
  expect(response.body.email).toBe("john.doe@example.com");
  expect(response.body.role).toBe("Admin");
  expect(response.body.privilege).toBe("System Admin");
});

test("PUT /users/update/:id should update user details", async () => {
  const userId = 1; // John Doe | Existing
  const response = await request
    .put(`/api/v1/users/update/${userId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Test",
      privilege: "Test Privilege",
    });

  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  expect(response.body.role).toBe("Test"); // Check if role is updated
  expect(response.body.privilege).toBe("Test Privilege"); // Check if privilege is updated
});

test("DELETE /users/delete/:id should delete a user", async () => {
  const userId = 1; // John Doe | Existing
  const response = await request
    .delete(`/api/v1/users/delete/${userId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
  expect(response.body.message).toBe("User deleted successfully");
});

test("POST /users/add should create a new user", async () => {
  const newUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "Password!123",
    role: "Admin",
    privilege: "System Admin",
  };

  const response = await request
    .post("/api/v1/users/add")
    .set("Authorization", `Bearer ${token}`)
    .send(newUser);

  expect(response.status).toBe(201);
  expect(response.body).toBeDefined();
  expect(response.body.name).toBe(newUser.name);
  expect(response.body.email).toBe(newUser.email);
  expect(response.body.role).toBe(newUser.role);
  expect(response.body.privilege).toBe(newUser.privilege);
});

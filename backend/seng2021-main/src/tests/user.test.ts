// import request from "supertest";
// import app from "../app";
// import pool from "../db";
// import bcrypt from "bcrypt";

// jest.mock("../db", () => ({
//   query: jest.fn().mockImplementation((queryText, values) => {
//     if (queryText.includes("SELECT * FROM users WHERE email")) {
//       return Promise.resolve({ rows: [], rowCount: 0 }); // Ensure rows is an array
//     }
//     return Promise.resolve({
//       rows: [{ id: 1, email: values[0], password: "hashedpassword" }],
//       rowCount: 1,
//     });
//   }),
// }));

// describe("User Authentication Routes", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("POST /shop/user/register", () => {
//     test("should register a user successfully", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "Doe",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe("User registered successfully");
//     });

//     test("should return 400 if email is already in use", async () => {
//       pool.query.mockResolvedValueOnce({
//         rowCount: 1,
//         rows: [{ email: "john@example.com" }],
//       });

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "Doe",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe("Email already in use");
//     });

//     test("should return 400 if invalid email", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "Doe",
//         email: "invalidEmail",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         'Please use a valid email format (i.e. "valid@email.com")'
//       );
//     });

//     test("should return 400 if invalid first name length", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "J",
//         nameLast: "Doe",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         "First name must be between 2-20 characters."
//       );
//     });

//     test("should return 400 if invalid last name length", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "D",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         "Last name must be between 2-20 characters."
//       );
//     });

//     test("should return 400 if invalid first name", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John!",
//         nameLast: "Doe",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         "First name can only contain letters, hyphens, spaces, and apostrophes."
//       );
//     });

//     test("should return 400 if invalid last name", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "Doe!",
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         "Last name can only contain letters, hyphens, spaces, and apostrophes."
//       );
//     });

//     test("should return 400 if invalid password", async () => {
//       pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // No existing user
//       // Successful insertion

//       const response = await request(app).post("/shop/user/register").send({
//         nameFirst: "John",
//         nameLast: "Doe",
//         email: "john@example.com",
//         password: "Password",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe(
//         "Password must be 8 or more characters with at least one number and letter"
//       );
//     });
//   });

//   describe("POST /shop/user/login", () => {
//     test("should login successfully and return a token", async () => {
//       const hashedPassword = await bcrypt.hash("Password123", 10);
//       pool.query.mockResolvedValueOnce({
//         rowCount: 1,
//         rows: [{ id: 1, email: "john@example.com", password: hashedPassword }],
//       });

//       const response = await request(app).post("/shop/user/login").send({
//         email: "john@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty("sessionDetails");
//     });

//     test("should return 400 if email is not registered", async () => {
//       pool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

//       const response = await request(app).post("/shop/user/login").send({
//         email: "invalid@example.com",
//         password: "Password123",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe("Invalid email or password");
//     });

//     test("should return 400 if password is incorrect", async () => {
//       const hashedPassword = await bcrypt.hash("CorrectPassword", 10);
//       pool.query.mockResolvedValueOnce({
//         rowCount: 1,
//         rows: [{ id: 1, email: "john@example.com", password: hashedPassword }],
//       });

//       const response = await request(app).post("/shop/user/login").send({
//         email: "john@example.com",
//         password: "WrongPassword",
//       });

//       expect(response.status).toBe(400);
//       expect(response.body.message).toBe("Invalid email or password");
//     });
//   });
// });

# Calorie Quest API Documentation

This document provides documentation for the Calorie Quest backend API.

## Authentication

Most endpoints require authentication using a Bearer token. To obtain a token, use the `/api/auth/login` endpoint. The token should be included in the `Authorization` header of subsequent requests.

Example: `Authorization: Bearer <your_token>`

---

## Auth Routes

Base path: `/api/auth`

### POST /login

Authenticates a user and returns a JWT access token.

- **Request Body:**
  - `username`: The user's email address.
  - `password`: The user's password.
  - *Content-Type*: `application/x-www-form-urlencoded`

- **Response (200 OK):**
  ```json
  {
    "access_token": "your_jwt_token",
    "token_type": "bearer"
  }
  ```

- **Responses (Error):**
  - `404 Not Found`: If the user is not found.
  - `400 Bad Request`: If the password is incorrect.

### GET /me

Retrieves the profile of the currently authenticated user.

- **Authentication:** Bearer Token required.
- **Response (200 OK):**
  - Returns a `User` object. The exact fields depend on the `User` model in `backend/lib/models/user.py`, but it will contain user information.

- **Responses (Error):**
  - `401 Unauthorized`: If the token is invalid or missing.

---

## User Routes

Base path: `/api/users`

### POST /register

Registers a new user.

- **Request Body:**
  - `username`: The user's email address.
  - `password`: The user's password (must be at least 6 characters).
  - *Content-Type*: `application/x-www-form-urlencoded`

- **Response (200 OK):**
  ```json
  {
    "access_token": "your_jwt_token",
    "token_type": "bearer"
  }
  ```

- **Responses (Error):**
  - `400 Bad Request`: If the email is already registered, the password is too short, or the email is not provided.
  - `500 Internal Server Error`: If there is a database error.

### GET /all

Retrieves a list of all registered users. (Note: This is likely for debugging/admin purposes and might be removed or protected in production).

- **Authentication:** None.
- **Response (200 OK):**
  - An array of user objects. The password field is excluded.

### GET /profile

Retrieves the profile of the currently authenticated user.

- **Authentication:** Bearer Token required.
- **Response (200 OK):**
  - A user profile object.

- **Responses (Error):**
  - `401 Unauthorized`: If the token is invalid or missing.
  - `404 Not Found`: If the user profile is not found.

### PUT /profile

Updates the profile of the currently authenticated user.

- **Authentication:** Bearer Token required.
- **Request Body:**
  - *Content-Type*: `application/json`
  ```json
  {
    "age": 30,
    "gender": "male",
    "height": 180.5,
    "weight": 75.0,
    "activityLevel": "sedentary",
    "goal": "weight_loss"
  }
  ```

- **Response (200 OK):**
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

- **Responses (Error):**
  - `401 Unauthorized`: If the token is invalid or missing.
  - `404 Not Found`: If the user profile is not found or no changes were made.
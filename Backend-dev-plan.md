# Backend Development Plan: CalorieQuest

### 1️⃣ Executive Summary
- This document outlines the plan to build a FastAPI backend for the CalorieQuest application.
- The backend will support all features visible in the existing frontend, including user authentication, onboarding, and daily food logging.
- **Constraints**: The project will use FastAPI (Python 3.13), MongoDB Atlas with Motor, and Pydantic v2. Development will follow a single-branch (`main`) Git workflow, with no Docker. Testing will be performed manually after each task.
- The development is broken down into a dynamic number of sprints (S0...Sn) to cover all frontend features.

### 2️⃣ In-Scope & Success Criteria
- **In-Scope Features:**
  - User registration and JWT-based login/logout.
  - User onboarding to set personal health goals (Quest).
  - Daily food logging (manual entry and search from a predefined list).
  - Dashboard to view daily calorie consumption and progress.
  - Ability to delete food entries.
- **Success Criteria:**
  - All frontend features are fully functional and connected to the live backend.
  - All task-level manual tests pass successfully via the user interface.
  - Each sprint's code is committed and pushed to the `main` branch after successful verification.

### 3️⃣ API Design
- **Base Path:** `/api/v1`
- **Error Envelope:** `{ "error": "message" }`

- **Authentication Endpoints:**
  - **`POST /api/v1/auth/signup`**
    - **Purpose:** Register a new user.
    - **Request:** `{ "email": "user@example.com", "password": "password123" }`
    - **Response:** `{ "token": "jwt.token.here" }`
    - **Validation:** Email must be unique. Password must be at least 6 characters.
  - **`POST /api/v1/auth/login`**
    - **Purpose:** Log in an existing user.
    - **Request:** `{ "email": "user@example.com", "password": "password123" }`
    - **Response:** `{ "token": "jwt.token.here" }`
    - **Validation:** Credentials must match a user in the database.
  - **`GET /api/v1/auth/me`**
    - **Purpose:** Get the current authenticated user's profile.
    - **Request:** (Requires JWT in `Authorization` header)
    - **Response:** `{ "email": "user@example.com", "profile": { ... } }`

- **Profile & Quest Endpoints:**
  - **`POST /api/v1/profile`**
    - **Purpose:** Create or update a user's profile and calculate their Quest.
    - **Request:** `{ "age": 25, "gender": "male", "height": 180, "weight": 75, "activityLevel": "moderate", "goal": "lose" }`
    - **Response:** `{ "dailyCalorieTarget": 2200 }`
    - **Validation:** All fields are required and must be within sensible ranges.

- **Food Log Endpoints:**
  - **`GET /api/v1/log/today`**
    - **Purpose:** Get all food entries for the current day.
    - **Request:** (Requires JWT)
    - **Response:** `[{ "id": "...", "name": "Apple", "quantity": "1 medium", "calories": 95, "timestamp": "..." }]`
  - **`POST /api/v1/log`**
    - **Purpose:** Add a new food entry to the daily log.
    - **Request:** `{ "name": "Apple", "quantity": "1 medium", "calories": 95 }`
    - **Response:** The newly created food entry object.
  - **`DELETE /api/v1/log/{entry_id}`**
    - **Purpose:** Delete a food entry from the log.
    - **Request:** (Requires JWT)
    - **Response:** `204 No Content`
  - **`GET /api/v1/foods/search`**
    - **Purpose:** Search for food items from the database.
    - **Request:** `?q=apple`
    - **Response:** `[{ "name": "Apple", "defaultQuantity": "1 medium", "calories": 95 }]`

### 4️⃣ Data Model (MongoDB Atlas)
- **`users` collection:**
  - `_id`: ObjectId (auto-generated)
  - `email`: String (required, unique)
  - `password`: String (required, hashed)
  - `profile`: Embedded Document
    - `age`: Number
    - `gender`: String (`male` or `female`)
    - `height`: Number (cm)
    - `weight`: Number (kg)
    - `activityLevel`: String
    - `goal`: String (`lose`, `maintain`, `gain`)
  - `quest`: Embedded Document
    - `dailyCalorieTarget`: Number
  - **Example:**
    ```json
    {
      "_id": "ObjectId('...')",
      "email": "test@example.com",
      "password": "hashed_password",
      "profile": { "age": 30, "gender": "female", "height": 165, "weight": 60, "activityLevel": "light", "goal": "maintain" },
      "quest": { "dailyCalorieTarget": 1800 }
    }
    ```
- **`food_entries` collection:**
  - `_id`: ObjectId (auto-generated)
  - `userId`: ObjectId (required, references `users`)
  - `name`: String (required)
  - `quantity`: String (required)
  - `calories`: Number (required)
  - `timestamp`: DateTime (required)
  - **Example:**
    ```json
    {
      "_id": "ObjectId('...')",
      "userId": "ObjectId('...')",
      "name": "Banana",
      "quantity": "1 large",
      "calories": 105,
      "timestamp": "2023-10-27T10:00:00Z"
    }
    ```
- **`foods` collection (for search):**
  - `_id`: ObjectId (auto-generated)
  - `name`: String (required)
  - `defaultQuantity`: String (required)
  - `calories`: Number (required)
  - **Example:**
    ```json
    {
      "_id": "ObjectId('...')",
      "name": "Chicken Breast",
      "defaultQuantity": "100g",
      "calories": 165
    }
    ```

### 5️⃣ Frontend Audit & Feature Map
- **`Register.tsx`**:
  - **Purpose:** User registration.
  - **Endpoint:** `POST /api/v1/auth/signup`
  - **Model:** `users`
- **`Login.tsx`**:
  - **Purpose:** User login.
  - **Endpoint:** `POST /api/v1/auth/login`
  - **Model:** `users`
- **`Onboarding.tsx`**:
  - **Purpose:** Collect user profile data to set up their Quest.
  - **Endpoint:** `POST /api/v1/profile`
  - **Model:** `users` (updates `profile` and `quest` fields)
- **`Index.tsx` (Dashboard)**:
  - **Purpose:** Display daily progress and food log.
  - **Endpoints:** `GET /api/v1/log/today`, `DELETE /api/v1/log/{entry_id}`
  - **Models:** `food_entries`, `users` (for `quest.dailyCalorieTarget`)
- **`AddFoodDialog.tsx`**:
  - **Purpose:** Add new food entries.
  - **Endpoints:** `POST /api/v1/log`, `GET /api/v1/foods/search`
  - **Models:** `food_entries`, `foods`

### 6️⃣ Configuration & ENV Vars
- `APP_ENV`: `development` or `production`
- `PORT`: `8000`
- `MONGODB_URI`: MongoDB Atlas connection string.
- `JWT_SECRET`: A long, random string for signing tokens.
- `JWT_EXPIRES_IN`: `86400` (24 hours in seconds)
- `CORS_ORIGINS`: The frontend URL (e.g., `http://localhost:5173`).

### 7️⃣ Testing Strategy (Manual via Frontend)
- All backend functionality will be validated exclusively through the frontend UI.
- Every task includes a specific **Manual Test Step** and a **User Test Prompt**.
- After all tasks in a sprint are tested and pass, the code will be committed and pushed to the `main` branch.
- If any test fails, the issue must be fixed and re-tested before pushing.

### 8️⃣ Dynamic Sprint Plan & Backlog

---

### S0 – Environment Setup & Frontend Connection

- **Objectives:**
  - Create a basic FastAPI application skeleton with `/api/v1` base path and a `/healthz` endpoint.
  - Establish a connection to MongoDB Atlas using the `MONGODB_URI`.
  - Implement the `/healthz` endpoint to perform a database ping and return a JSON status.
  - Configure CORS to allow requests from the frontend application.
  - Replace all dummy API URLs in the frontend with the real backend URLs.
  - Initialize a Git repository at the project root, set the default branch to `main`, and create a `.gitignore` file.
- **Definition of Done:**
  - The backend server runs locally and successfully connects to the MongoDB Atlas instance.
  - The `/healthz` endpoint returns a `200 OK` status indicating a successful database connection.
  - The frontend application successfully makes requests to the backend.
  - The project is pushed to a GitHub repository on the `main` branch.
- **Tasks:**
  - **Task 1: Initialize FastAPI Project & Git**
    - **Manual Test Step:** Run `uvicorn main:app --reload`. Open `http://127.0.0.1:8000/healthz` in the browser.
    - **Expected Result:** See `{"status": "ok", "db_connection": "successful"}`.
    - **User Test Prompt:** "Start the backend server and visit the `/healthz` URL. Confirm that the status shows a successful DB connection."
  - **Task 2: Connect Frontend to Backend**
    - **Manual Test Step:** Update the `api.ts` file in the frontend to point to `http://127.0.0.1:8000`. Start the frontend.
    - **Expected Result:** The frontend should load without CORS errors in the browser console.
    - **User Test Prompt:** "Run the frontend and backend simultaneously. Open the browser's developer tools and confirm there are no CORS errors in the console."

---

### S1 – Basic Auth (Signup / Login)

- **Objectives:**
  - Implement JWT-based user signup and login functionality.
  - Protect the main dashboard page, requiring authentication to access it.
- **User Stories:**
  - As a new user, I want to create an account with my email and password.
  - As an existing user, I want to log in to access my dashboard.
- **Definition of Done:**
  - The signup and login flows work end-to-end from the frontend UI.
  - Protected routes redirect unauthenticated users to the login page.
- **Tasks:**
  - **Task 1: Implement User Signup**
    - **Manual Test Step:** Use the registration form in the UI to create a new account.
    - **Expected Result:** A success message is displayed, and the user is redirected to the login page. A new user document is created in the `users` collection with a hashed password.
    - **User Test Prompt:** "Create a new account using the signup form and verify that you are redirected to the login page."
  - **Task 2: Implement User Login**
    - **Manual Test Step:** Use the login form with the newly created account credentials.
    - **Expected Result:** The user is successfully logged in, a JWT is stored in `localStorage`, and the user is redirected to the onboarding page.
    - **User Test Prompt:** "Log in with your new account and confirm you are taken to the onboarding page."
  - **Task 3: Implement Logout and Protected Routes**
    - **Manual Test Step:** After logging in, click the logout button. Try to access the main dashboard URL directly.
    - **Expected Result:** The user is logged out, the token is cleared, and accessing a protected page redirects back to the login page.
    - **User Test Prompt:** "Log out of the application. Try to visit the main dashboard page and confirm you are redirected to the login screen."

---

### S2 – Onboarding & Quest Setup

- **Objectives:**
  - Allow logged-in users to submit their profile information.
  - Calculate and save the user's daily calorie target (Quest).
- **User Stories:**
  - As a new user, I want to provide my physical details and goals to get a personalized calorie target.
- **Definition of Done:**
  - The onboarding form successfully saves the user's profile and quest data to their user document in MongoDB.
- **Tasks:**
  - **Task 1: Implement Profile & Quest Creation**
    - **Manual Test Step:** Complete and submit the onboarding form after logging in.
    - **Expected Result:** The user is redirected to the main dashboard. The user's document in the `users` collection is updated with the `profile` and `quest` information.
    - **User Test Prompt:** "Fill out the onboarding form after logging in. Check your user record in the database to confirm your profile and daily calorie target have been saved."

---

### S3 – Core Feature: Food Logging

- **Objectives:**
  - Implement the full CRUD (Create, Read, Delete) functionality for daily food logs.
  - Implement the food search functionality.
- **User Stories:**
  - As a user, I want to add food I've eaten to my daily log.
  - As a user, I want to see a list of all foods I've logged today.
  - As a user, I want to remove a food entry if I make a mistake.
  - As a user, I want to search for common foods to log them quickly.
- **Definition of Done:**
  - Users can add, view, and delete food entries for the current day.
  - The dashboard correctly reflects the total calories consumed.
  - The food search returns results from the database.
- **Tasks:**
  - **Task 1: Create Food Search Endpoint**
    - **Manual Test Step:** Populate the `foods` collection with sample data. Use the "Search" tab in the "Add Food" dialog in the UI.
    - **Expected Result:** Typing in the search box filters and displays matching food items from the database.
    - **User Test Prompt:** "Add some sample foods to the database. Use the search bar in the app to find one of them and confirm it appears in the results."
  - **Task 2: Implement Add Food Entry**
    - **Manual Test Step:** Use the "Add Food" dialog (both search and manual tabs) to add a few items to your log.
    - **Expected Result:** The food items appear in the "Daily Food Log" table on the dashboard, and the "Today's Quest" progress bar updates correctly. New documents are created in the `food_entries` collection.
    - **User Test Prompt:** "Add a food item using the 'Add Food' button. Verify that it appears on your dashboard and the calorie count updates."
  - **Task 3: Implement View & Delete Food Entries**
    - **Manual Test Step:** Refresh the dashboard page. Click the trash icon next to a food entry.
    - **Expected Result:** The food log persists after a refresh. Deleting an entry removes it from the UI and the database, and the calorie count updates.
    - **User Test Prompt:** "Refresh the page and confirm your food log is still there. Then, delete an item and verify that it is removed and the total calories decrease."
# Code Arena Backend

## Project Overview
This project is a backend service for a Quizizz-like coding quiz platform. The system supports multiple coding languages (Python, C++, Java) and allows for both self-paced and multiplayer quizzes. It features a lobby for waiting, host-controlled game sessions, and real-time leaderboards.

## Features (Sprint 1)
- **Basic Server Setup:** Express-based server with Socket.IO integration.
- **Environment Setup:** Project initialized with WebStorm and Node.js LTS.
- **Version Control:** Git initialized with a properly configured `.gitignore`.
- **Development Scripts:** Includes npm scripts for starting the server (`npm start`) and development mode with Nodemon (`npm run dev`).

## Sprint 2: User Authentication

**Overview:**  
In Sprint 2, we focused on setting up the backend authentication endpoints for host users. This sprint involved creating registration and login endpoints, integrating JSON Web Tokens (JWT) for automatic login, and ensuring our API responses align with the front-end requirements provided by Yaire.

### Endpoints Implemented

#### 1. Registration Endpoint
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Request Body Example:**
  ```json
  {
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpassword"
  }


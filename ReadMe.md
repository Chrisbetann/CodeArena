# Code Arena Backend npm run dev lsof -i :3000 / kill -9 PID


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

## Sprint 3: Multiplayer & Game Session Management

**Overview:**  
In Sprint 3, our focus is on enabling multiplayer functionality. We’re implementing features for lobby creation and management, host controls/game configuration, and game session management. This sprint lays the groundwork for real‑time gameplay by integrating Socket.IO for live updates.

---

### 1. Lobby Creation & Management

**Endpoints Implemented:**

- **Create Lobby**  
  **URL:** `POST /api/lobby/create`  
  **Request Body Example:**
  ```json
  {
    "hostUsername": "HostName",
    "settings": { "difficulty": "easy", "language": "Python" }
  }

## Sprint 4: Enhanced Game Session Management & Real-Time Leaderboard

**Overview:**  
In Sprint 4, we focused on optimizing our game session management to create a dynamic and seamless multiplayer experience. Key improvements include:

- **Persistent Storage Integration:**  
  Transitioning from in-memory storage to using MongoDB Atlas for lobbies and game sessions.

- **Answer Validation & Scoring:**  
  Implementing logic to validate players' answers against the correct ones and calculate scores—including time-based bonuses—within our `/submit` endpoint.

- **Real-Time Leaderboard Updates:**  
  Using Socket.IO to broadcast live leaderboard updates to all players in a lobby immediately after an answer is submitted.

- **Optimized Game Session Management:**  
  Adding a `/nextQuestion` endpoint to automatically advance the game session to the next question, clear previous answers, and broadcast the new question to all connected clients.

**Endpoints Implemented:**
- **Lobby Endpoints:**
  - `POST /api/lobby/create`
  - `POST /api/lobby/join`
  - `POST /api/lobby/:lobbyCode/config`
  - `GET /api/lobby/:lobbyCode`

- **Game Session Endpoints:**
  - `POST /api/session/start`
  - `POST /api/session/submit`
  - `POST /api/session/nextQuestion`
  - `GET /api/session/:lobbyCode`

**Real-Time Communication:**
- Integrated Socket.IO in our server to handle events such as `joinLobby`, `leaderboardUpdate`, and `newQuestion`, ensuring that all clients in a lobby receive immediate updates.

**Next Steps:**
- Further refine scoring logic and answer validation.
- Enhance UI integration for real-time leaderboard updates.
- Implement timer events to automatically trigger question progression.




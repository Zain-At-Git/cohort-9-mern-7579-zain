# Notes App

A full-stack notes application with user authentication, built with the MERN-inspired stack (React, Node.js, Express, MySQL).

## Features
- User authentication (Signup/Login) with JWT
- Create, edit, and delete notes
- Rich text editor for note content
- User-scoped data access (users only see their own notes)
- Request logging with Pino
- Centralized error handling

## Tech Stack
- **Frontend:** React, React Router, Axios, React Quill
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Auth:** JWT, bcrypt
- **Logging:** Pino

## Project Structure
\`\`\`
├── backend/
│   ├── config/       # DB and logger configuration
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth and error handling
│   ├── routes/        # API routes
│   └── server.js
└── frontend/
    └── src/
        ├── api/        # Axios instance
        ├── components/ # Reusable components
        └── pages/      # Page components
\`\`\`

## Setup

### Backend
\`\`\`bash
cd backend
npm install
# Create a .env file (see .env.example)
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Environment Variables
See \`.env.example\` in both \`backend\` and \`frontend\` folders.
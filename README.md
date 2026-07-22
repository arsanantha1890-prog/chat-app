# Chatify — Real-Time Chat Application

A full-stack real-time messaging app built with the MERN stack and Socket.IO. Users can sign up, log in, send text and image messages instantly, see who's online, and manage their profiles — all with production-grade authentication and security.

**Live Demo:** [chatify-sun7.onrender.com](https://chatify-sun7.onrender.com)

---

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Zustand, Socket.IO Client, Axios, React Router, React Hot Toast

**Backend:** Node.js, Express, Socket.IO, Mongoose, JWT, bcryptjs, Cloudinary, Resend, Arcjet

**Database:** MongoDB Atlas

**Deployment:** Render (single-service deployment serving both frontend and backend)

---

## Features

- **Real-time messaging** — Messages are delivered instantly via WebSocket connections using Socket.IO, with HTTP REST as the persistence layer and sockets for push delivery.
- **JWT cookie authentication** — Secure httpOnly cookies with `sameSite: strict` and `secure` flags, shared between REST routes and WebSocket connections through a unified auth strategy.
- **Optimistic UI updates** — Messages appear instantly in the sender's chat before the server confirms, with automatic rollback on failure.
- **Image sharing** — Users can send images in chat and update profile pictures, uploaded via Cloudinary with CDN-backed delivery.
- **Online presence** — Real-time tracking of which users are currently online, powered by an in-memory socket map that broadcasts on connect/disconnect.
- **Security layer** — Arcjet middleware provides rate limiting (sliding window, 100 req/60s), bot detection, and shield protection against common attacks like SQL injection — applied before authentication so unauthenticated traffic is blocked early.
- **Welcome emails** — New users receive a welcome email on signup via Resend.
- **Notification sounds** — Toggleable audio notifications for incoming messages.
- **Responsive design** — Works on desktop and mobile with Tailwind CSS.

---

## Architecture

```
Client (React + Vite)
  │
  ├── REST API (Axios) ──► Express Server
  │                            ├── Arcjet Middleware (rate limit, bot detection, shield)
  │                            ├── Auth Middleware (JWT cookie verification)
  │                            ├── Controllers (business logic)
  │                            ├── Models (Mongoose → MongoDB Atlas)
  │                            └── Services (Cloudinary, Resend)
  │
  └── WebSocket (Socket.IO) ──► Socket Server (same HTTP server)
                                   ├── Socket Auth Middleware (JWT from cookie)
                                   └── Event Handlers (online users, new messages)
```

**Key design decision:** Messages are sent via REST (POST to `/api/messages/send/:id`), persisted to MongoDB, and then pushed to the receiver via Socket.IO if they're online. This ensures messages are never lost even if the socket connection drops — the REST call is the source of truth, and the socket is the delivery mechanism.

---

## Project Structure

```
chat-app/
├── backend/
│   └── src/
│       ├── server.js                  # Entry point — Express + Socket.IO setup
│       ├── lib/
│       │   ├── env.js                 # Centralized environment variable access
│       │   ├── db.js                  # MongoDB connection via Mongoose
│       │   ├── socket.js              # Socket.IO server, online user tracking
│       │   ├── utils.js               # JWT token generation + cookie config
│       │   ├── cloudinary.js          # Cloudinary SDK configuration
│       │   ├── resend.js              # Resend email client setup
│       │   └── arcjet.js              # Arcjet security rules configuration
│       ├── models/
│       │   ├── User.js                # User schema (email, name, password, profilePic)
│       │   └── Message.js             # Message schema (sender, receiver, text, image)
│       ├── middleware/
│       │   ├── auth.middleware.js      # JWT verification for REST routes
│       │   ├── socket.auth.middleware.js  # JWT verification for WebSocket connections
│       │   └── arcjet.middleware.js    # Rate limiting + bot detection + shield
│       ├── controllers/
│       │   ├── auth.controller.js     # Signup, login, logout, profile update
│       │   └── message.controller.js  # Send/get messages, contacts, chat partners
│       ├── routes/
│       │   ├── auth.route.js          # /api/auth/* endpoints
│       │   └── message.route.js       # /api/messages/* endpoints
│       └── emails/
│           ├── emailHandlers.js       # Email sending logic
│           └── emailTemplates.js      # HTML email templates
├── frontend/
│   └── src/
│       ├── App.jsx                    # Root component with routing
│       ├── main.jsx                   # React entry point
│       ├── lib/axios.js               # Axios instance with base URL + credentials
│       ├── store/
│       │   ├── useAuthStore.js        # Auth state, socket connection, online users
│       │   └── useChatStore.js        # Chat state, messages, optimistic updates
│       ├── pages/
│       │   ├── ChatPage.jsx           # Main chat interface
│       │   ├── LoginPage.jsx          # Login form
│       │   └── SignUpPage.jsx         # Signup form
│       └── components/               # UI components (ChatContainer, MessageInput, etc.)
└── package.json                       # Root scripts for unified build + start
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Resend account
- Arcjet account

### Installation

```bash
git clone https://github.com/arsanantha1890-prog/chat-app.git
cd chat-app
npm install --prefix backend
npm install --prefix frontend
```

### Environment Variables

Create `backend/.env` with the following:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your-resend-key
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Chatify
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development
```

### Run Locally

```bash
# Terminal 1 — backend
npm run dev --prefix backend

# Terminal 2 — frontend
npm run dev --prefix frontend
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend on `http://localhost:3000`.

### Build for Production

```bash
npm run build    # Installs deps for both + builds frontend
npm start        # Starts backend, serves frontend from dist/
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Create account |
| POST | `/login` | No | Log in |
| POST | `/logout` | No | Log out (clears cookie) |
| GET | `/check` | Yes | Verify auth status |
| PUT | `/update-profile` | Yes | Update profile picture |

### Messages (`/api/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/contacts` | Yes | Get all users |
| GET | `/chats` | Yes | Get users you've chatted with |
| GET | `/:id` | Yes | Get message history with a user |
| POST | `/send/:id` | Yes | Send a message (text and/or image) |

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `getOnlineUsers` | Server → Client | Broadcasts list of online user IDs |
| `newMessage` | Server → Client | Pushes a new message to the receiver |

---

## Security

- **Authentication:** JWT stored in httpOnly, secure, sameSite strict cookies — resistant to XSS and CSRF
- **Password hashing:** bcrypt with salt rounds of 10
- **Rate limiting:** Arcjet sliding window — 100 requests per 60 seconds per client
- **Bot protection:** Arcjet bot detection blocks automated traffic (allows search engine crawlers)
- **Attack shielding:** Arcjet shield guards against common injection attacks
- **Socket authentication:** WebSocket connections are authenticated using the same JWT cookie, verified via dedicated socket middleware
- **Input validation:** Email regex validation, password length checks, message length limits (2000 chars)
- **Credential safety:** Generic "Invalid credentials" error on login — never reveals whether email or password was incorrect

---

## Deployment

Deployed on **Render** as a single web service:

1. Build command: `npm run build` (installs both frontend and backend dependencies, builds React app)
2. Start command: `npm start` (starts Express server which serves the built frontend)
3. Environment variable `NPM_CONFIG_PRODUCTION=false` ensures devDependencies (Vite) are available during build
4. `CLIENT_URL` set to the Render URL for CORS and Socket.IO origin matching

---

## License

MIT

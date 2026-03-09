# space7

A topic-based discussion platform where each **Space** represents one discussion topic with a single continuous message thread. Messages can receive **Appreciations** (likes) to surface high-quality contributions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js, Sequelize ORM, PostgreSQL |
| Realtime | Socket.IO |
| Queue | BullMQ + Redis |
| File Storage | Cloudinary |
| Auth | JWT + bcrypt |
| Email | Nodemailer |
| Validation | Joi |
| Infrastructure | Docker + Docker Compose |
| Frontend | React Native (Expo), Axios, Socket.IO client, React Navigation, Context API |

---

## Project Structure

```
space7/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, Redis, Cloudinary config
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/     # Auth, error, validation middleware
│   │   ├── models/         # Sequelize models + associations
│   │   ├── queues/         # BullMQ queue definitions
│   │   ├── routes/         # Express route definitions
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Socket.IO server
│   │   ├── utils/          # Helpers (JWT, OTP, email, word counter)
│   │   ├── validators/     # Joi schemas
│   │   ├── workers/        # BullMQ workers
│   │   ├── app.js          # Express app
│   │   └── server.js       # HTTP server entry point
│   ├── Dockerfile
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # AuthContext, SocketContext
│   │   ├── navigation/     # AppNavigator
│   │   ├── screens/        # All app screens
│   │   └── services/       # API service layer
│   ├── App.js
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) 18+ (for mobile development)
- [Expo CLI](https://docs.expo.dev/) (for React Native)

### 1. Clone and configure

```bash
cd space7
cp .env.example .env
```

Edit `.env` and fill in your actual values for:
- `JWT_SECRET` — any strong secret string
- `CLOUDINARY_*` — your Cloudinary credentials
- `SMTP_*` — your email provider credentials

### 2. Start the backend (Docker)

```bash
docker-compose up --build
```

This starts:
- **Backend** on `http://localhost:5000`
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

The database schema is auto-synced by Sequelize on startup.

### 3. Start the mobile app

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

> **Note:** Update the `API_BASE_URL` in `mobile/src/services/api.js` and `SOCKET_URL` in `mobile/src/contexts/SocketContext.js` to your machine's local IP if testing on a physical device (e.g., `http://192.168.x.x:5000`).

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |

### Spaces
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/spaces/trending` | Trending spaces |
| GET | `/api/spaces/search?q=` | Search spaces |
| GET | `/api/spaces/tag/:tag` | Search by hashtag |
| GET | `/api/spaces/recommended` | Recommended for user |
| GET | `/api/spaces/my` | User's joined spaces |
| POST | `/api/spaces` | Create a space |
| GET | `/api/spaces/:id` | Get space details |
| POST | `/api/spaces/:id/join` | Join a space |
| POST | `/api/spaces/:id/invite` | Generate invite code |
| DELETE | `/api/spaces/:id/members/:userId` | Remove member |
| PUT | `/api/spaces/:id/lock` | Toggle lock |
| PUT | `/api/spaces/:id/archive` | Archive space |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/:spaceId` | List messages (sort=recent\|most_appreciated) |
| POST | `/api/messages/:spaceId` | Send message (supports media upload) |
| POST | `/api/messages/:spaceId/:messageId/appreciate` | Toggle appreciation |
| DELETE | `/api/messages/:spaceId/:messageId` | Delete message |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/me` | Own profile + stats |
| GET | `/api/profile/user/:userId` | Other user profile |
| GET | `/api/profile/search?q=` | Search users |
| PUT | `/api/profile/username` | Update username |
| PUT | `/api/profile/bio` | Update bio |
| PUT | `/api/profile/picture` | Upload avatar |
| PUT | `/api/profile/password` | Change password |
| DELETE | `/api/profile/account` | Delete account |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Socket.IO Events
| Event | Direction | Description |
|---|---|---|
| `join_space` | Client → Server | Join a space room |
| `leave_space` | Client → Server | Leave a space room |
| `send_message` | Client → Server | Send message to space |
| `receive_message` | Server → Client | New message received |
| `message_appreciated` | Server → Client | Message appreciation update |

---

## Environment Variables

See `.env.example` for the complete list.

---

## License

MIT

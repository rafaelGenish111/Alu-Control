# Glass Dynamics Demo

Multi-tenant SaaS application built with MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- 🔐 Multi-tenant architecture
- 🌍 Internationalization (Hebrew, English, Spanish) with RTL support
- 🌓 Dark/Light mode with auto detection
- 📱 Mobile-friendly installer app
- 🔄 Real-time order management
- 📊 Production tracking
- 🛠️ Repair management
- 👥 User management
- 📦 Supplier management

## Project Structure

```
glass-dynamics-demo/
├── client/          # React frontend (Vite)
├── server/          # Express.js backend API
└── DEPLOYMENT.md    # Deployment instructions
```

## Local Development

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd glass-dynamics-demo
```

2. **Setup Server**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT_SECRET
npm run dev
```

3. **Setup Client**
```bash
cd client
npm install
npm run dev
```

4. **Seed Demo Data** (optional)
```bash
cd server
npm run seed:demo
```

The application will be available at:
- Frontend: http://localhost:5174
- Backend API: http://localhost:5001

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

## Environment Variables

### Server (.env)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5001)
- `CORS_ORIGIN` - Allowed CORS origin (for production)

### Client (.env)
- `VITE_API_URL` - Backend API URL (for production)

## Default Login

After seeding demo data:
- Email: `admin@bizflow.com`
- Password: `SecretPassword123!`

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, i18next
- **Backend**: Express.js 5, MongoDB, Mongoose, JWT
- **Deployment**: Vercel

## License

ISC

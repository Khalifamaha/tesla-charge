# TeslaCharge Backend

## Description
Backend server for Tesla charging station reservation system.

## Technology Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation
```bash
npm install
```

## Environment Variables
The `.env` file contains:
- `PORT=3000` - Server port
- `JWT_SECRET` - JWT secret key
- `DB_PATH` - Database file path

## Database
- **SQLite database**: `tesla-charge-real.db`
- **Tables**: users, vehicles, stations, otp_codes, reservations

## API Endpoints

### Authentication
- `POST /api/send-otp` - Send OTP code
- `POST /api/verify-otp` - Verify OTP and get token

### Vehicles
- `GET /api/vehicles` - Get user vehicles
- `POST /api/vehicles` - Register new vehicle

### Stations
- `GET /api/stations` - Get charging stations

### Reservations
- `GET /api/reservations` - Get user reservations
- `POST /api/reservations` - Create reservation

### User
- `GET /api/user` - Get user profile

## Start Server
```bash
node server-final.js
```

## Features
- ✅ OTP verification system
- ✅ Vehicle registration
- ✅ Station management
- ✅ Reservation system
- ✅ Real-time pricing
- ✅ SQLite database persistence

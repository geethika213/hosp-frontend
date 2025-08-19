# Healthcare Assistant Backend API

A comprehensive Node.js/Express backend for the Healthcare Assistant application with MongoDB database, JWT authentication, and real-time features.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Patients, Doctors, and Admin roles
- **Appointment System**: Complete booking, scheduling, and management
- **AI-Powered Chat**: Intelligent appointment booking assistance
- **Video Consultations**: Telemedicine support with real-time communication
- **Real-time Updates**: Socket.IO for live notifications and chat
- **Email Notifications**: Automated appointment confirmations and reminders
- **Database**: MongoDB with Mongoose ODM

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Environment Setup**:
```bash
cp env.example .env
```

3. **Configure environment variables** in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/healthcare-assistant
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB** (if using local installation)

5. **Seed the database**:
```bash
npm run seed
```

6. **Start the server**:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/online-status` - Update doctor online status
- `PUT /api/auth/location` - Update doctor location

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments (filtered by user role)
- `GET /api/appointments/:id` - Get single appointment
- `PUT /api/appointments/:id` - Update appointment
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/reschedule` - Reschedule appointment
- `PUT /api/appointments/:id/rate` - Rate appointment (patients only)
- `GET /api/appointments/slots/:doctorId` - Get available slots

### Doctors
- `GET /api/doctors` - Get all doctors (with filters)
- `GET /api/doctors/:id` - Get doctor profile
- `POST /api/doctors/search` - Search doctors by symptoms/location
- `GET /api/doctors/:id/availability` - Get doctor availability
- `GET /api/doctors/dashboard/stats` - Doctor dashboard statistics

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `GET /api/patients/medical-history` - Get medical history
- `PUT /api/patients/medical-history` - Update medical history
- `GET /api/patients/appointments` - Get patient appointments
- `GET /api/patients/dashboard/stats` - Patient dashboard stats
- `POST /api/patients/search-doctors` - Search doctors for booking

### Chat & AI
- `POST /api/chat/start` - Start AI chat session
- `POST /api/chat/:chatId/message` - Send chat message
- `GET /api/chat/:chatId/messages` - Get chat messages
- `PUT /api/chat/:chatId/context` - Update AI context
- `PUT /api/chat/:chatId/close` - Close chat session

### Video Consultations
- `POST /api/video/room` - Create video call room
- `GET /api/video/room/:roomId` - Join video call
- `PUT /api/video/room/:roomId/end` - End video call
- `GET /api/video/history` - Get video call history

### User Management (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `GET /api/users/stats/overview` - User statistics

## Database Schema

### User Model
- Basic info (name, email, phone)
- Role-based fields (patient/doctor specific)
- Authentication fields
- Medical history (patients)
- Professional info (doctors)

### Appointment Model
- Patient and doctor references
- Date/time scheduling
- Medical details and notes
- Video call information
- Rating and feedback

### Chat Model
- AI-powered conversation tracking
- Message history
- Booking context and progress

## Demo Accounts

After running the seed script, you can use these demo accounts:

**Patient Account**:
- Email: `patient1@demo.com`
- Password: `demo123`

**Doctor Account**:
- Email: `dr.johnson@demo.com`
- Password: `demo123`

**Admin Account**:
- Email: `admin@demo.com`
- Password: `demo123`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Role-based access control

## Real-time Features

- Live chat messaging
- Video call signaling
- Appointment notifications
- Doctor status updates
- Typing indicators

## Development

### Running Tests
```bash
npm test
```

### API Documentation
The API follows RESTful conventions with consistent response formats:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // for paginated responses
}
```

### Error Handling
All errors return a consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // validation errors if applicable
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a cloud MongoDB service (MongoDB Atlas)
3. Configure proper JWT secrets
4. Set up email service credentials
5. Configure OpenAI API key for AI features
6. Use a process manager like PM2

## Optional Integrations

- **OpenAI**: For enhanced AI chat responses
- **Cloudinary**: For file/image uploads
- **Twilio**: For SMS notifications and video calls
- **Stripe**: For payment processing

## Support

For issues or questions, please check the API documentation or contact the development team.

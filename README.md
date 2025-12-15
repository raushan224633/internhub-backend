# materially  Backend API

Backend server for materially  - Internship Management Platform

## 🚀 Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/materially 
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3001
```

3. Make sure MongoDB is running locally or use MongoDB Atlas

## 🏃 Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "intern", // or "employer"
  "phone": "1234567890",
  "companyName": "Company Name" // only for employer
}
```

#### Login User
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User (Protected)
```
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### Update Profile (Protected)
```
PUT /api/auth/update-profile
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "name": "Updated Name",
  "phone": "9876543210"
}
```

#### Change Password (Protected)
```
PUT /api/auth/change-password
Headers: {
  "Authorization": "Bearer <token>"
}
Body: {
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## 🗄️ Database Models

### User Model
- name, email, password
- role: intern | employer | admin
- phone, avatar
- education, skills, resume (for interns)
- companyName, companyWebsite, companyDescription (for employers)

### Job Model
- title, company, description
- requirements, responsibilities, skills
- location, jobType, duration
- stipend, openings
- applicationDeadline, startDate
- employer (reference to User)
- applicants (array of User references)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login/register, you'll receive a token that should be included in the Authorization header for protected routes:

```
Authorization: Bearer <your_token_here>
```

## 📝 Response Format

Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

## 🛠️ Development

- The server runs on `http://localhost:5000` by default
- MongoDB connection: `mongodb://localhost:27017/materially `
- CORS is enabled for `http://localhost:3001` (frontend)

## 📄 License

ISC

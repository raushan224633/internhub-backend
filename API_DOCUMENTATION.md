# materially  Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Jobs](#jobs-endpoints)
3. [Applications](#applications-endpoints)
4. [Messages](#messages-endpoints)
5. [Profile](#profile-endpoints)

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employer", // or "intern"
  "companyName": "Tech Corp" // for employer only
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employer"
  }
}
```

---

## 💼 Jobs Endpoints

### Get All Jobs (Public)
**GET** `/jobs?page=1&limit=10&search=developer&location=Delhi&jobType=remote&skills=javascript,react`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by title or company
- `location` (optional): Filter by location
- `jobType` (optional): full-time, part-time, remote, hybrid
- `skills` (optional): Comma-separated skills

### Get Job by ID
**GET** `/jobs/:id`

### Create Job (Employer Only)
**POST** `/jobs`
**Auth Required:** Employer

**Body:**
```json
{
  "title": "Frontend Developer Intern",
  "company": "Tech Corp",
  "description": "Looking for a talented frontend developer...",
  "requirements": ["React", "JavaScript", "HTML/CSS"],
  "responsibilities": ["Build UI components", "Collaborate with team"],
  "skills": ["React", "JavaScript", "Git"],
  "location": "Delhi, India",
  "jobType": "remote",
  "duration": "3 months",
  "stipend": {
    "min": 10000,
    "max": 15000,
    "currency": "INR"
  },
  "openings": 2,
  "applicationDeadline": "2025-12-31",
  "startDate": "2026-01-15",
  "status": "active"
}
```

### Get Employer's Jobs
**GET** `/jobs/employer/my-jobs?status=active&page=1&limit=10`
**Auth Required:** Employer

**Query Parameters:**
- `status` (optional): active, closed, draft
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Employer Analytics
**GET** `/jobs/analytics/stats`
**Auth Required:** Employer

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": {
      "total": 10,
      "active": 7,
      "closed": 3
    },
    "applications": {
      "total": 45,
      "pending": 15,
      "shortlisted": 10,
      "rejected": 15,
      "recent": 8
    },
    "topJobs": [...],
    "applicationsTrend": [...]
  }
}
```

### Update Job
**PUT** `/jobs/:id`
**Auth Required:** Employer (Job Owner)

**Body:** Same as create job (partial updates allowed)

### Delete Job
**DELETE** `/jobs/:id`
**Auth Required:** Employer (Job Owner)

---

## 📝 Applications Endpoints

### Apply for Job (Intern Only)
**POST** `/applications`
**Auth Required:** Intern

**Body:**
```json
{
  "jobId": "job_id_here",
  "coverLetter": "I am interested in this position...",
  "resume": "https://example.com/resume.pdf"
}
```

### Get Intern's Applications
**GET** `/applications/intern/my-applications?status=pending&page=1&limit=10`
**Auth Required:** Intern

**Query Parameters:**
- `status` (optional): pending, reviewed, shortlisted, rejected, accepted
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Employer's Applications
**GET** `/applications/employer?status=pending&jobId=job_id&page=1&limit=10`
**Auth Required:** Employer

**Query Parameters:**
- `status` (optional): pending, reviewed, shortlisted, rejected, accepted
- `jobId` (optional): Filter by specific job
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): createdAt, status
- `order` (optional): asc, desc

### Get Applications for Specific Job
**GET** `/applications/job/:jobId?status=pending&page=1&limit=10`
**Auth Required:** Employer (Job Owner)

### Get Application by ID
**GET** `/applications/:id`
**Auth Required:** Employer or Applicant

### Update Application Status (Employer Only)
**PUT** `/applications/:id/status`
**Auth Required:** Employer

**Body:**
```json
{
  "status": "shortlisted",
  "notes": "Great candidate, schedule interview"
}
```

**Status Options:**
- `pending`
- `reviewed`
- `shortlisted`
- `rejected`
- `accepted`

### Withdraw Application (Intern Only)
**DELETE** `/applications/:id`
**Auth Required:** Intern (Applicant)

---

## 💬 Messages Endpoints

### Send Message
**POST** `/messages`
**Auth Required:** Yes

**Body:**
```json
{
  "receiver": "user_id",
  "subject": "Regarding Frontend Position",
  "message": "Hello, I would like to discuss...",
  "relatedJob": "job_id_optional",
  "attachments": [
    {
      "name": "resume.pdf",
      "url": "https://example.com/resume.pdf",
      "type": "application/pdf"
    }
  ]
}
```

### Get Messages (Inbox/Sent)
**GET** `/messages?type=inbox&isRead=false&page=1&limit=20`
**Auth Required:** Yes

**Query Parameters:**
- `type` (optional): inbox, sent, all (default: inbox)
- `isRead` (optional): true, false
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get All Conversations
**GET** `/messages/conversations`
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "avatar_url",
        "role": "employer"
      },
      "lastMessage": {
        "message": "Last message text",
        "createdAt": "2025-12-12T10:00:00.000Z",
        "isRead": false
      },
      "unreadCount": 3
    }
  ]
}
```

### Get Conversation with User
**GET** `/messages/conversation/:userId?page=1&limit=50`
**Auth Required:** Yes

### Mark Message as Read
**PUT** `/messages/:id/read`
**Auth Required:** Yes (Receiver only)

### Delete Message
**DELETE** `/messages/:id`
**Auth Required:** Yes (Sender or Receiver)

---

## 👤 Profile Endpoints

### Get Current User Profile
**GET** `/profile`
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employer",
    "phone": "+91 9876543210",
    "avatar": "avatar_url",
    "companyName": "Tech Corp",
    "companyWebsite": "https://techcorp.com",
    "companyDescription": "Leading tech company...",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Profile
**PUT** `/profile`
**Auth Required:** Yes

**Body (Employer):**
```json
{
  "name": "John Doe",
  "phone": "+91 9876543210",
  "avatar": "avatar_url",
  "companyName": "Tech Corp",
  "companyWebsite": "https://techcorp.com",
  "companyDescription": "Leading tech company..."
}
```

**Body (Intern):**
```json
{
  "name": "Jane Smith",
  "phone": "+91 9876543210",
  "avatar": "avatar_url",
  "skills": ["JavaScript", "React", "Node.js"],
  "education": [
    {
      "institution": "ABC University",
      "degree": "Bachelor of Technology",
      "field": "Computer Science",
      "startDate": "2021-08-01",
      "endDate": "2025-06-01",
      "current": true
    }
  ],
  "resume": "https://example.com/resume.pdf"
}
```

### Change Password
**PUT** `/profile/password`
**Auth Required:** Yes

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Get User by ID
**GET** `/profile/:id`
**Auth Required:** Yes

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (in development mode)"
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalJobs": 95,
    "limit": 10
  }
}
```

---

## 🔒 Authorization Roles

- **Public**: No authentication required
- **Intern**: Authenticated intern users
- **Employer**: Authenticated employer users
- **Admin**: Authenticated admin users (future)

---

## 📌 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 Getting Started

1. Start the backend server:
```bash
cd backend
npm install
npm run dev
```

2. Test the API using tools like:
   - Postman
   - Thunder Client (VS Code Extension)
   - cURL
   - Frontend application

3. Make sure MongoDB is running and connected

---

## 📝 Notes

- All dates should be in ISO 8601 format
- File uploads (avatars, resumes) should be handled separately (e.g., using Cloudinary or AWS S3)
- The API includes proper error handling and validation
- All sensitive data is properly secured
- CORS is enabled for specified origins

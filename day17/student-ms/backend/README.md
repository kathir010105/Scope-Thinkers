# Student Management System - Backend

Node.js/Express backend for privileged Firebase Admin operations.

## Purpose

The backend handles operations that require Firebase Admin SDK privileges:
- Creating Firebase Auth users (without affecting admin's frontend session)
- Managing user accounts (activate/deactivate/role changes)
- Creating and managing invitations
- Verifying Firebase ID tokens for API authorization

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` from the frontend root to `backend/.env` and fill in the values:
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

   **To get Firebase Admin credentials:**
   1. Go to [Firebase Console](https://console.firebase.google.com/)
   2. Select your project → Project Settings → Service Accounts
   3. Click "Generate new private key"
   4. Save the JSON file securely
   5. Extract `project_id`, `client_email`, and `private_key` from the JSON

3. **Run the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/verify` - Verify Firebase ID token and return user profile

### Admin - User Management
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user (creates Firebase Auth + Firestore profile)
- `PATCH /api/admin/users/:uid` - Update user profile (including role/status)
- `POST /api/admin/users/:uid/activate` - Activate user
- `POST /api/admin/users/:uid/deactivate` - Deactivate user

### Admin - Registration Requests
- `GET /api/admin/registration-requests` - List pending registrations
- `POST /api/admin/registration-requests/:uid/approve` - Approve registration
- `POST /api/admin/registration-requests/:uid/reject` - Reject registration

### Admin - Invitations
- `GET /api/admin/invitations` - List all invitations
- `POST /api/admin/invitations` - Create new invitation

### Public - Invitation Redemption
- `POST /api/invitations/redeem` - Redeem invitation token (creates user account)

## Authorization

All admin endpoints require:
1. Valid Firebase ID token in `Authorization: Bearer <token>` header
2. User profile with `role: "admin"` and `status: "approved"`

The backend **never trusts role values from the client** - it always loads the user's Firestore profile to determine authorization.

## Security Notes

- Firebase Admin SDK runs only on the backend
- Service account credentials are never exposed to the frontend
- All privileged operations go through the backend
- Tokens are verified using Firebase Admin `verifyIdToken()`
- Custom claims can be set for role-based access if needed

## Frontend Integration

The frontend should:
1. Get the current user's ID token: `const token = await currentUser.getIdToken()`
2. Include it in API requests: `headers: { Authorization: \`Bearer \${token}\` }`
3. Call backend endpoints for privileged operations instead of using Firebase Admin SDK directly
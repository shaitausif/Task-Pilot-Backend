# TaskPilot Backend

A scalable Express.js backend for task, note, and project management with secure JWT authentication, user/admin dashboards, and robust logging. Built with TypeScript, MongoDB (Mongoose), and ready for cloud deployment.

---

## Features

- **Authentication:** JWT-based login, registration, refresh, and logout.
- **User Management:** Profile APIs, role-based access (User/Admin).
- **Tasks:** CRUD, search, status, priority, due dates, user/admin views.
- **Notes:** CRUD, search by title/content.
- **Projects:** CRUD, add/remove tasks, get project tasks.
- **Dashboards:** User stats (tasks, notes, projects, recent tasks), Admin stats (users, all tasks/notes/projects).
- **Validation:** All endpoints use `express-validator` for input checks.
- **Logging:** HTTP logs (Morgan), error/info logs (Winston), all files in `/logs`.
- **Environment:** Loads secrets/config from `.env`.

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/shaitausif/Task-Pilot-Backend.git
cd taskpilot-backend
npm ci
```

### 2. Environment Setup

Create a `.env` file in the root directory. Example:

```
# MongoDB
MONGODB_URI=your-mongodb-uri

# JWT
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
JWT_EXPIRES=1h

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary 
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Run in Development

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## API Structure

- **Auth:** `/api/v1/auth`  
  Register, login, refresh token, logout.

- **Users:** `/api/v1/users`  
  Profile, admin user management.

- **Tasks:** `/api/v1/tasks`  
  Create, read, update, delete, search, admin view.

- **Notes:** `/api/v1/notes`  
  Create, read, update, delete, search.

- **Projects:** `/api/v1/projects`  
  Create, read, update, delete, add/remove tasks, get project tasks.

- **Dashboard:** `/api/v1/dashboard`  
  User stats, admin stats.

---

## Logging

- **HTTP logs:** `logs/http.log` (Morgan)
- **Error logs:** `logs/error.log` (Winston)
- **Info logs:** `logs/info.log` (Winston)

---

## Validation

All routes use `express-validator` for input validation.  
See `/src/validators/` for details.

---

## Customization

- Add service credentials in `.env` (see above).
- links to your cloud/database/email services here:
  ```
  MongoDB: https://www.mongodb.com/products/platform/atlas-database

  cloudinary: https://cloudinary.com/
  ```

---

## Useful Commands

| Command           | Description                       |
|-------------------|-----------------------------------|
| `npm run dev`     | Start dev server (auto-reload)    |
| `npm run build`   | Compile TypeScript to `/dist`     |
| `npm start`       | Run compiled server (production)  |
| `npx tsc --noEmit`| Type-check only                   |

---

## Folder Structure

```
src/
  controllers/
  models/
  routes/
  validators/
  middlewares/
  utils/
  logger/
logs/
.env
package.json
```

---

## Contributing

- Fork, clone, and submit PRs.
- Open issues for bugs or feature requests.

---

## License

ISC

## Contact

For questions or support, open an issue or contact the author.

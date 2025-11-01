# VARNA: Handwriting Champion

A full-stack web application for managing handwriting competition registrations for students across Karnataka. This application allows individual student registrations and bulk school registrations with an admin panel for managing submissions.

## Features

- 🎨 **Modern UI**: Beautiful, responsive design with interactive animations
- 👥 **Individual Registration**: Students can register with their details
- 🏫 **School Registration**: Schools can submit bulk participant lists via Excel/CSV
- 🔐 **Admin Panel**: Secure admin authentication and dashboard to view all registrations
- 📊 **Data Management**: MongoDB for persistent storage of registration data
- 📁 **File Upload**: Support for participant sheet uploads (Excel/CSV files)
- 🌐 **Deployment Ready**: Configured for production deployment on Render

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Vanta.js** - Interactive background animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Multer** - File uploads

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── main.jsx       # Entry point
│   │   └── VarnaApp.jsx   # Main app component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Backend Express application
│   ├── models/
│   │   ├── IndividualRegistration.js
│   │   └── SchoolRegistration.js
│   ├── uploads/           # Uploaded files (gitignored)
│   ├── server.js          # Main server file
│   └── package.json
├── render.yaml            # Render deployment config
├── env.template           # Environment variables template
├── .gitignore
└── README.md

```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database (local or Atlas cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "application forms"
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   Create a `server/.env` file:
   ```bash
   cp env.template server/.env
   ```
   
   Edit `server/.env` with your actual values:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ADMIN_EMAIL=your_admin_email@example.com
   ADMIN_PASSWORD=your_secure_password
   PORT=4000
   ```

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   Server runs on `http://localhost:4000`

2. **Start the frontend dev server** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   App opens at `http://localhost:5173`

3. **Access the application**
   - Public pages: Registration forms for students and schools
   - Admin panel: Access via "Admin Login" button using credentials from `.env`

## API Endpoints

### Public Endpoints
- `POST /api/public/registrations/individual` - Submit individual registration
- `POST /api/public/registrations/school` - Submit school registration (with file upload)
- `GET /api/health` - Health check
- `GET /api/health/db` - Database health check

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/registrations/individual` - Get all individual registrations
- `GET /api/admin/registrations/school` - Get all school registrations

## Deployment

This project is configured for deployment on Render.

### Render Deployment Setup

1. **Create a MongoDB database**
   - Use MongoDB Atlas (free tier available)
   - Get your connection string

2. **Create a Web Service on Render**
   - Connect your GitHub repository
   - Root Directory: `server`
   - Build Command: 
     ```bash
     npm ci && cd ../client && npm ci && npm run build
     ```
   - Start Command: `npm start`

3. **Set Environment Variables**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong random string
   - `ADMIN_EMAIL`: Your admin email
   - `ADMIN_PASSWORD`: Your admin password
   - `PORT`: Leave as default (Render sets this automatically)

4. **Deploy**
   - Render will automatically build and deploy your application
   - The frontend will be served as static files from `client/dist`

### Production Checklist

- ✅ Update `JWT_SECRET` to a strong random string
- ✅ Change default admin credentials
- ✅ Use MongoDB Atlas production cluster
- ✅ Enable CORS appropriately (configured for all origins currently)
- ✅ Set up file storage (consider S3 for production uploads)
- ✅ Configure domain and SSL
- ✅ Set up monitoring and logging

## Development Notes

### File Uploads
- Uploads are stored in `server/uploads/` directory
- Files are renamed with timestamp prefix for uniqueness
- Supported formats: `.xls`, `.xlsx`, `.csv`

### Database Collections
- `registrations_individual` - Individual student registrations
- `registrations_school` - School bulk registrations

### Admin Authentication
- Token-based authentication using JWT
- Tokens expire after 12 hours
- Stored in localStorage on client side

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for VARNA handwriting competition.

## Support

For questions or support, contact:
- Email: info@vedanshgroup.in
- Website: www.vedanshgroup.in

---

**Organizer**: Vedansh Group


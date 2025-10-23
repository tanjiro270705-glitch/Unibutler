# UniButler - Personal Study Assistant

UniButler is a comprehensive study management application that helps students track their tasks, monitor their mood, and boost productivity with AI-powered insights. The application features a beautiful landing page, real-time API integration, and a modern responsive design.

## 🚀 Features

### Frontend (React + Vite)
- **Beautiful Landing Page**: Modern hero section with feature showcase and call-to-action
- **User Authentication**: Secure login and registration with JWT tokens
- **Task Management**: Create, update, and track academic tasks with due dates
- **Mood Tracking**: Monitor emotional well-being and stress levels
- **Dashboard**: AI-powered insights and productivity analytics
- **Responsive Design**: Mobile-first approach with modern UI components
- **Real API Integration**: No mock data - all features connect to live backend

### Backend (Spring Boot + MongoDB)
- **RESTful API**: Complete CRUD operations for all resources
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Scalable NoSQL database
- **CORS Configuration**: Proper cross-origin resource sharing
- **Data Validation**: Input validation and error handling
- **User Management**: Registration, login, and profile management

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization
- **CSS3** - Modern styling with animations

### Backend
- **Spring Boot 3.5.6** - Java framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Maven** - Dependency management
- **Lombok** - Code generation

## 📁 Project Structure

```
greenhub/
├── Backend/
│   └── server/
│       ├── src/main/java/com/unibutler/
│       │   ├── config/          # CORS and configuration
│       │   ├── controller/      # REST API endpoints
│       │   ├── dto/            # Data transfer objects
│       │   ├── model/          # Database entities
│       │   ├── repo/           # Data repositories
│       │   └── service/        # Business logic
│       └── src/main/resources/
│           └── application.properties
└── unibutler-client/
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── pages/             # Page components
    │   │   ├── LandingPage/   # Beautiful landing page
    │   │   ├── Login/         # Authentication
    │   │   ├── Register/      # User registration
    │   │   ├── Dashboard/     # Main dashboard
    │   │   ├── Tasks/         # Task management
    │   │   └── Mood/          # Mood tracking
    │   └── shared/            # API utilities and events
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend/server
   ```

2. **Configure database connection:**
   Update `src/main/resources/application.properties` with your MongoDB connection string:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/
   spring.data.mongodb.database=unibutler
   ```

3. **Run the backend:**
   ```bash
   mvn spring-boot:run
   ```
   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd unibutler-client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint (optional):**
   Create a `.env` file in the `unibutler-client` directory:
   ```env
   VITE_API_BASE=http://localhost:8080/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📱 Features Overview

### Landing Page
- **Hero Section**: Eye-catching introduction with animated preview
- **Feature Showcase**: Six key features with icons and descriptions
- **Call-to-Action**: Clear registration and login buttons
- **Responsive Design**: Optimized for all device sizes

### Authentication
- **Secure Registration**: Email validation and password requirements
- **JWT Login**: Token-based authentication with automatic redirect
- **Protected Routes**: Secure access to authenticated features
- **Session Management**: Automatic token validation and refresh

### Task Management
- **Create Tasks**: Add tasks with titles, descriptions, and due dates
- **Status Tracking**: TODO, IN_PROGRESS, DONE status management
- **Real-time Updates**: Instant UI updates with API synchronization
- **Task Deletion**: Safe task removal with confirmation

### Mood Tracking
- **Daily Logging**: Track mood (1-5) and stress levels (1-10)
- **Notes**: Add contextual notes to mood entries
- **History View**: Review past mood and stress patterns
- **Data Visualization**: Charts and trends in dashboard

### Dashboard
- **Weekly Summary**: Task completion and productivity metrics
- **AI Insights**: Personalized recommendations and patterns
- **Growth Trends**: Visual charts showing mood, stress, and productivity
- **Smart Suggestions**: AI-powered study and time management tips

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List user tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Mood
- `GET /api/moods/latest` - Get recent mood logs
- `POST /api/moods` - Log new mood entry

### Dashboard
- `GET /api/dashboard/weekly-summary` - Weekly analytics
- `GET /api/dashboard/growth` - Growth trend data
- `GET /api/suggestions` - AI suggestions

## 🎨 Design System

### Color Palette
- **Primary**: #667eea (Blue gradient)
- **Secondary**: #764ba2 (Purple gradient)
- **Accent**: #ffd700 (Gold)
- **Success**: #28a745 (Green)
- **Danger**: #dc3545 (Red)
- **Warning**: #ffc107 (Yellow)

### Typography
- **Font Family**: System fonts (SF Pro, Segoe UI, Roboto)
- **Headings**: 800 weight for hero, 600-700 for sections
- **Body**: 400 weight with 1.6 line height

### Components
- **Buttons**: Rounded corners, hover animations, multiple variants
- **Cards**: Subtle shadows, rounded corners, hover effects
- **Forms**: Clean inputs with focus states and validation
- **Navigation**: Fixed header with smooth transitions

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file:
   ```bash
   mvn clean package
   ```

2. Deploy to your preferred cloud platform (Heroku, AWS, etc.)

3. Update CORS configuration for production domain

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Spring Boot for robust backend capabilities
- MongoDB for flexible data storage
- Vite for lightning-fast development experience

---

**UniButler** - Your personal study assistant for academic success! 🎓✨

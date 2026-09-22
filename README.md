# AI Adaptive Learning Platform

An AI-powered adaptive learning platform that personalizes the learning experience based on each learner's knowledge level, learning progress, quiz performance, and mastery.

This project is an **MVP (Minimum Viable Product)** developed as a full-stack web application.

---

## 📌 Project Overview

The AI Adaptive Learning Platform is designed to provide a personalized learning experience through an adaptive learning loop.

The system evaluates the learner's progress and performance, then uses that information to determine what the learner should study next.

### MVP Learning Loop

```text
Register / Login
       ↓
Select Course
       ↓
Diagnostic Assessment
       ↓
Knowledge Level Evaluation
       ↓
Generate Learning Path
       ↓
Lesson
       ↓
Exercise / Quiz
       ↓
Mastery Evaluation
       ↓
Adaptive Engine
       ↓
Next Lesson Selection
       ↓
AI Tutor
       ↓
Progress Dashboard
       ↓
Repeat Learning Loop
```

---

## ✨ Features

### Authentication

* User registration
* User login
* Password hashing
* JWT authentication
* Student role
* User profile

### Course Management

* View available courses
* View course details
* View course lessons
* Course enrollment
* Course difficulty and category

### Learning System

* Personalized learning path
* Lesson progress tracking
* Lesson start / completion
* Mastery score tracking
* Learning progress tracking
* Next lesson recommendation

### Quiz System

* Quiz for each lesson
* Multiple-choice questions
* Quiz attempts
* Automatic score calculation
* Passing score
* Quiz answer tracking
* Mastery evaluation

### Adaptive Learning

The adaptive engine uses learning progress and performance data to determine the learner's next learning step.

The system can use information such as:

* Lesson progress
* Mastery score
* Quiz performance
* Course enrollment
* Previous learning activity

### AI Tutor

The AI Tutor provides question-and-answer assistance related to the current lesson.

MVP Level 1 focuses on:

```text
Student asks a question
        ↓
AI Tutor
        ↓
Context-aware explanation
        ↓
Student continues learning
```

### Dashboard

The dashboard provides an overview of the learner's learning activity, including:

* Learning progress
* Current learning path
* Recommended courses
* Continue learning
* Course progress

---

# 🏗️ System Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│         Next.js 15           │
│          React 19            │
└──────────────┬───────────────┘
               │ HTTP / REST API
               ↓
┌──────────────────────────────┐
│            API               │
│          NestJS 11           │
│                              │
│ ┌────────┐ ┌──────────────┐ │
│ │ Auth   │ │ Learning     │ │
│ ├────────┤ ├──────────────┤ │
│ │Course  │ │ Adaptive     │ │
│ ├────────┤ ├──────────────┤ │
│ │ Quiz   │ │ AI Tutor     │ │
│ └────────┘ └──────────────┘ │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│           Prisma             │
│          ORM 7.9             │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│      PostgreSQL / Neon       │
│                              │
│ Users                        │
│ Courses                      │
│ Lessons                      │
│ Quizzes                      │
│ Quiz Questions               │
│ Quiz Attempts                │
│ Enrollments                  │
│ Learning Progress            │
│ Learning Analytics           │
│ AI Recommendations           │
└──────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* Next.js 15
* React 19
* TypeScript
* Lucide React
* CSS / JSX styling

## Backend

* NestJS 11
* TypeScript
* JWT
* bcrypt
* class-validator
* class-transformer

## Database

* PostgreSQL
* Neon PostgreSQL
* Prisma ORM 7.9.1

## AI

* Google Gemini API
* `@google/genai`

The project also includes OpenAI SDK support for future AI integrations.

## Development Tools

* Node.js
* pnpm
* Git
* PowerShell
* Prisma Studio

## Deployment

* Frontend: Production deployment
* Backend: Render
* Database: Neon PostgreSQL

---

# 📁 Project Structure

```text
ai-adaptive-learning/
│
├── apps/
│   │
│   ├── web/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── lesson/
│   │   │   ├── quiz/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   │
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── courses/
│       │   ├── lessons/
│       │   ├── learning/
│       │   ├── quiz/
│       │   ├── adaptive/
│       │   ├── ai/
│       │   ├── health/
│       │   ├── prisma/
│       │   └── main.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       │
│       └── package.json
│
├── packages/
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# 🗄️ Database

The application uses PostgreSQL through Prisma ORM.

### Main Tables

```text
users
user_profiles
courses
lessons
enrollments
learning_progress
learning_analytics
quizzes
quiz_questions
quiz_attempts
quiz_answers
ai_recommendations
```

### Main Relationships

```text
User
 ├── User Profile
 ├── Enrollments
 ├── Learning Progress
 ├── Quiz Attempts
 ├── Learning Analytics
 └── AI Recommendations

Course
 ├── Lessons
 └── Enrollments

Lesson
 ├── Quiz
 └── Learning Progress

Quiz
 ├── Quiz Questions
 └── Quiz Attempts

Quiz Attempt
 └── Quiz Answers
```

---

# 🚀 Getting Started

## Requirements

Make sure the following are installed:

* Node.js 22+
* pnpm 11+
* PostgreSQL / Neon PostgreSQL
* Git

Check versions:

```bash
node -v
pnpm -v
```

---

# 📦 Installation

Clone the repository:

```bash
git clone <repository-url>
```

Enter the project:

```bash
cd ai-adaptive-learning
```

Install dependencies:

```bash
pnpm install
```

---

# 🔐 Environment Variables

Create:

```text
apps/api/.env
```

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

GEMINI_API_KEY="your-gemini-api-key"

JWT_SECRET="your-jwt-secret"

FRONTEND_URL="http://localhost:3000"
```

### Environment Variable Description

| Variable         | Description                         |
| ---------------- | ----------------------------------- |
| `DATABASE_URL`   | PostgreSQL / Neon connection string |
| `GEMINI_API_KEY` | API key for Gemini AI               |
| `JWT_SECRET`     | Secret used for JWT authentication  |
| `FRONTEND_URL`   | Frontend URL used for CORS          |

> Never commit `.env` files or API keys to Git.

---

# 🧬 Prisma Setup

After installing dependencies:

```bash
cd apps/api
```

Generate Prisma Client:

```bash
pnpm prisma generate
```

If the database already exists and you want to synchronize the Prisma schema:

```bash
pnpm prisma db pull
```

---

# 🌱 Database Seed

The project includes a seed script that creates initial learning data.

Run:

```bash
pnpm db:seed
```

The seed creates:

```text
1 Course
5 Lessons
5 Quizzes
15 Quiz Questions
1 Enrollment
Learning Progress
Learning Analytics
```

The seed uses an existing active student account.

Therefore, register a user first if the database does not contain an active student.

---

# 🖥️ Prisma Studio

To inspect the database:

```bash
pnpm prisma studio
```

Prisma Studio will normally be available at:

```text
http://localhost:51212
```

---

# ▶️ Running the Application

## Start Backend

From:

```text
apps/api
```

Run:

```bash
pnpm dev
```

The API runs on:

```text
http://localhost:3001/api
```

Health check:

```text
http://localhost:3001/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "ai-adaptive-learning-api"
}
```

---

## Start Frontend

From:

```text
apps/web
```

Run:

```bash
pnpm dev
```

The frontend normally runs on:

```text
http://localhost:3000
```

---

# 🔌 API Overview

Base URL:

```text
/api
```

## Authentication

```text
POST /auth/register
POST /auth/login
```

## Courses

```text
GET /courses
GET /courses/:id
GET /courses/:id/lessons
```

## Learning

```text
GET  /learning/next
GET  /learning/path
GET  /learning/lesson/:lessonId
POST /learning/lesson/:lessonId/start
POST /learning/lesson/:lessonId/complete
```

## Adaptive Learning

```text
GET /adaptive/recommendation/:lessonId
```

## Quiz

```text
GET  /quiz/lesson/:lessonId
POST /quiz/:quizId/start
POST /quiz/submit
```

## AI Tutor

```text
POST /ai/tutor
```

## Lessons

```text
GET /lessons/:id
```

## Health

```text
GET /health
```

---

# 🔄 Learning Flow

A typical student session follows this process:

### 1. Register / Login

The user creates an account and receives a JWT token.

### 2. Select Course

The user selects a course from the available courses.

### 3. Diagnostic / Knowledge Evaluation

The system evaluates the learner's current knowledge.

### 4. Learning Path

The system determines the learner's learning sequence.

### 5. Lesson

The learner studies the selected lesson.

### 6. Quiz

The learner completes the lesson quiz.

### 7. Mastery Evaluation

The system evaluates the learner's performance.

### 8. Adaptive Engine

The system uses learning data to determine the next lesson.

### 9. AI Tutor

The learner can ask questions about the current lesson.

### 10. Dashboard

The learner can view learning progress.

### 11. Repeat

The process continues as the learner progresses through the course.

---

# 🤖 AI Tutor

The MVP currently implements **Level 1 AI Tutor**.

### Level 1

```text
Question
   ↓
AI Tutor
   ↓
Answer / Explanation
```

The purpose of Level 1 is to provide conversational assistance during lessons.

Future versions may include:

* Context-aware tutoring
* Personalized explanations
* Hint generation
* Socratic questioning
* Automatic difficulty adjustment
* Learning weakness detection
* AI-generated exercises
* AI-generated quizzes

---

# 🧠 Adaptive Learning

The adaptive engine is designed to personalize lesson selection using learner performance.

Conceptually:

```text
Learning Data
     ↓
Mastery Evaluation
     ↓
Adaptive Engine
     ↓
Next Lesson
```

Potential inputs include:

* Quiz score
* Mastery score
* Lesson progress
* Previous attempts
* Learning history
* Course structure

This allows the platform to move beyond a simple linear course structure.

---

# 📊 Learning Analytics

The system stores learning analytics such as:

* Average score
* Completion rate
* Study time
* Strong topics
* Weak topics
* Last updated time

This data can be used by the adaptive engine and dashboard.

---

# 🚢 Production Deployment

The production architecture uses:

```text
User Browser
     ↓
Production Frontend
     ↓
Render API
     ↓
Neon PostgreSQL
```

The backend is deployed on Render.

The production API is configured using environment variables.

### Production Environment Variables

```env
DATABASE_URL="your-neon-production-url"
GEMINI_API_KEY="your-production-gemini-key"
JWT_SECRET="your-production-jwt-secret"
FRONTEND_URL="your-production-frontend-url"
```

Production secrets should be configured through the hosting provider rather than committed to the repository.

---

# 🧪 Testing Checklist

Before releasing a new version, test the complete learning loop.

### Authentication

* [ ] Register
* [ ] Login
* [ ] Invalid login
* [ ] JWT authentication
* [ ] Logout

### Course

* [ ] Course list
* [ ] Course details
* [ ] Enrollment
* [ ] Lesson list

### Learning

* [ ] Start lesson
* [ ] Complete lesson
* [ ] Progress update
* [ ] Next lesson
* [ ] Learning path

### Quiz

* [ ] Start quiz
* [ ] Display questions
* [ ] Submit answers
* [ ] Calculate score
* [ ] Store attempt
* [ ] Update mastery

### AI Tutor

* [ ] Ask question
* [ ] Receive response
* [ ] Handle AI errors
* [ ] Handle empty question

### Dashboard

* [ ] Course progress
* [ ] Current lesson
* [ ] Recommended learning
* [ ] Progress statistics

---

# 🔒 Security Notes

Do not commit:

```text
.env
API keys
JWT secrets
Database passwords
Production credentials
```

Use environment variables for all secrets.

Passwords are stored using hashing rather than plain text.

JWT is used for authenticated API requests.

---

# 📈 Future Development

Possible future improvements include:

## AI Tutor Level 2

```text
Lesson Context
      +
Learning History
      +
Mastery
      ↓
Personalized AI Tutor
```

## Advanced Adaptive Engine

* Knowledge graph
* Skill dependency
* Difficulty adjustment
* Weakness detection
* Personalized review
* Spaced repetition

## AI-Generated Learning Content

* AI-generated lessons
* AI-generated exercises
* AI-generated quizzes
* Automatic explanations
* Personalized examples

## Advanced Analytics

* Learning behavior analysis
* Knowledge gap detection
* Performance trends
* Course completion prediction
* Learning recommendations

---

# 📚 Project Status

Current status:

```text
MVP COMPLETE
```

The core learning loop has been implemented and tested end-to-end.

### Current MVP

```text
Authentication        ✅
Course System         ✅
Lesson System         ✅
Quiz System           ✅
Learning Progress     ✅
Mastery Evaluation    ✅
Adaptive Engine       ✅
Learning Path         ✅
AI Tutor Level 1      ✅
Dashboard             ✅
PostgreSQL / Neon     ✅
Prisma                ✅
Production API        ✅
```

---

# 👨‍💻 Development Approach

This project was developed using a **Scaffold → Business Logic → Integration → Deployment** approach.

### Phase 1 — Scaffold

* Monorepo
* Frontend
* Backend
* Database
* Basic routing

### Phase 2 — Business Logic

* Authentication
* Courses
* Lessons
* Quiz
* Learning progress
* Adaptive learning

### Phase 3 — AI

* AI Tutor
* AI integration
* Personalized learning support

### Phase 4 — Integration

* Frontend ↔ API
* API ↔ Database
* AI ↔ Learning system

### Phase 5 — Deployment

* Production database
* Production API
* Production frontend
* Environment configuration

---

# 📄 License

This project is developed as an academic / personal project.

License information can be added here if the project is later released under an open-source license.

---

# 🙏 Acknowledgements

Built with:

* Next.js
* React
* NestJS
* Prisma
* PostgreSQL
* Neon
* Google Gemini
* Render
* TypeScript

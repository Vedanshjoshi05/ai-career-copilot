# 🤖 AI Career Copilot

> An AI-powered career preparation platform that helps students optimize resumes, identify skill gaps, prepare for interviews, and build personalized learning roadmaps using Large Language Models (LLMs).

![MERN](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-OpenRouter-purple)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Live Demo

**Frontend:** https://ai-career-copilot-pearl.vercel.app

**Backend API:** https://ai-career-copilot-vhdz.onrender.com

---

## 📌 Overview

AI Career Copilot is a full-stack MERN application designed to help students and job seekers improve their career readiness using AI.

The platform analyzes resumes, evaluates job-role fit, generates personalized learning roadmaps, conducts mock interviews, and provides actionable recommendations powered by LLMs through OpenRouter.

---

## ✨ Features

### 📄 Resume Analyzer

* Upload PDF resumes
* AI-powered ATS evaluation
* Skill extraction and analysis
* Resume scoring and feedback
* Improvement suggestions

### 🎯 Job Match Analysis

* Compare resumes against job descriptions
* Identify missing skills
* Calculate compatibility scores
* Generate optimization recommendations

### 🎤 AI Mock Interviews

* Role-specific interview generation
* Technical and behavioral questions
* AI-based answer evaluation
* Performance tracking

### 🧠 Skill Gap Detection

* Analyze current skillset
* Compare with target role requirements
* Readiness percentage calculation
* Learning recommendations

### 🗺️ Career Roadmap Generator

* Personalized 6-month learning roadmap
* Monthly milestones
* Progress tracking

### 💼 Project Recommendation Engine

* Skill-based project suggestions
* Beginner to advanced difficulty levels
* Portfolio-focused recommendations

### 📊 Analytics Dashboard

* Resume score tracking
* Interview performance insights
* User activity analytics
* Progress visualization

### 🔐 Authentication & Security

* JWT Authentication
* Password hashing with bcrypt
* Role-based authorization
* Rate limiting and API protection

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* React Hot Toast

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer
* pdf-parse

### AI Integration

* OpenRouter API
* DeepSeek Chat V3
* Claude / GPT-compatible architecture

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

## 📁 Project Structure

```bash
ai-career-copilot/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── vite.config.js
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Vedanshjoshi05/ai-career-copilot.git
cd ai-career-copilot
```

### Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=deepseek/deepseek-chat-v3-0324

NODE_ENV=development
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

Run Backend

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing (bcryptjs)
* Helmet Security Headers
* Global Rate Limiting
* AI Endpoint Rate Limiting
* CORS Protection
* Input Validation
* File Type Validation (PDF Only)

---

## 📡 Core API Modules

### Authentication

* Register User
* Login User
* Profile Management

### Resume

* Upload Resume
* Analyze Resume
* Resume Tailoring

### Interview

* Start Interview
* Submit Answers
* AI Evaluation

### Skills

* Skill Gap Analysis

### Roadmaps

* Generate Learning Roadmap
* Track Progress

### Dashboard

* User Analytics
* Performance Metrics

---

## 🎯 Key Engineering Highlights

* Modular MVC Architecture
* Service Layer Design Pattern
* JWT-Based Authentication System
* AI-Powered Resume & Interview Evaluation
* RESTful API Design
* MongoDB Data Modeling
* Production Deployment on Vercel & Render
* Scalable Structure for Future AI Features

---

## 📈 Future Improvements

* Redis Caching
* Resume Version Comparison
* AI Chat Career Coach
* WebSocket-Based Mock Interviews
* Interview Video Analysis
* Advanced Analytics & Insights

---

## 👨‍💻 Author

**Vedansh Joshi**

GitHub: https://github.com/Vedanshjoshi05

---

## 📄 License

This project is licensed under the MIT License.

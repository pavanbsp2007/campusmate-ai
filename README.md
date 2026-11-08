# CampusMate AI
> **Tagline:** *Study Smarter. Manage Better. Live Campus Life.*

CampusMate AI is a modern, unified, full-stack college productivity platform designed specifically for university students. It pairs an intelligent **AI Study Companion** with an everyday **College Survival Kit** into a single SaaS application with responsive web and Android mobile experiences.

---

## 🌟 Key Product Features

### 1. 🤖 AI Study Companion
- **AI Academic Tutor**: Explains complex theorems, algorithms, and concepts step-by-step with adjustable explanation depths (*Beginner/ELI5*, *Undergraduate*, *Exam-Oriented*, *Expert*) and syntax-highlighted code snippets.
- **PDF Document Summarizer**: Upload lecture PDFs, textbook chapters, or paste raw notes. Extracts chapter-wise summaries, key definitions, and revision takeaways. Includes one-click Markdown export.
- **AI MCQ Generator & Test Simulator**: Generates 4-option MCQs from any subject or topic with instant scoring, timer, and detailed answer explanations.
- **Active Recall Flashcards**: Interactive 3D flip-card viewer with *Easy*, *Medium*, and *Hard* spaced-repetition recall ratings.
- **Exam Preparation Mode**: Enter subject, syllabus topics, examination date, and available study hours to generate an optimal revision schedule, predicted exam questions, and high-weightage topics.
- **University Answer Generator**: Structures answers formatted specifically to academic scoring rubrics:
  - **2-Mark Answers**: Concise definitions and core invariants.
  - **5-Mark Answers**: Introduction, 4 core points, diagram descriptions, and viva notes.
  - **10-Mark Answers**: Comprehensive theoretical framework, mathematical bounds, code implementation, and comparative trade-off matrix.

### 2. 🎒 College Survival Kit *(100% Free Forever)*
- **Attendance Manager & Bunk Predictor**:
  - Live percentage calculation across subjects.
  - **Bunk Calculator**: Computes exactly how many classes you can miss while staying safely above the mandatory 75% university threshold.
  - **Recovery Calculator**: Computes how many consecutive classes you must attend if below the threshold.
  - **"What-If" Bunk Simulator**: Interactive slider sandbox to simulate future attendance before bunking.
  - One-click *Present (+1)* and *Absent* logger.
- **CGPA & SGPA Calculator**:
  - Semester SGPA tracking with course credits and letter grades.
  - Cumulative CGPA calculation with academic distinction badges.
  - Configurable grading scales (10-Point Standard Indian University scale and 4-Point US/International scale).
  - **Target CGPA Projector**: Calculates the required future SGPA needed across remaining credits to graduate with a desired CGPA.
- **Assignment Manager**:
  - Deadlines tracker with countdown indicators (*Overdue*, *Due Soon* alerts).
  - Priority tags (*Urgent*, *High*, *Medium*, *Low*).
  - Status management (Pending, In Progress, Completed).
- **Timetable & Class Schedule**:
  - Day-by-Day schedule view and full **Weekly Lecture Matrix**.
  - Lecture room numbers, block/building names, and faculty details.
- **Student Expense & Budget Tracker**:
  - Category-wise spending breakdown (*Food/Mess, Books, Transport, Hostel, Entertainment, Other*).
  - Monthly allowance budgeting with visual progress bar and overbudget alerts.
- **Exam Countdown**:
  - Days-remaining countdown for midterms, lab exams, and semester endterms.
  - One-click launch into **AI Exam Prep Mode** with syllabus prefilled.
- **Notes & Document Manager**:
  - Markdown notes editor with subject categorization and tags.
  - Search, favorite filtering, and `.md` file download.

### 3. ⏱️ Smart Study Planner
- Daily study goals with progress tracking and celebratory completion confetti.
- Integrated **Pomodoro Focus Timer** (25m Focus Block, 5m Short Break, 15m Rest Break) with circular audio/visual cues.
- Study session logger and subject-wise focus time distribution analytics.
- **AI Study Schedule Recommendations** dynamically tailored to upcoming exam deadlines.

### 4. 🤝 Student Peer Resource Hub
- Share and download Previous Year Question Papers (PYQs), handwritten notes, and solved lab codes.
- Upvoting system and automated content moderation reporting.

### 5. 🔔 Notification System
- Real-time in-app notification center.
- Automated alerts for low attendance warnings (< 75%), assignments due within 48 hours, upcoming exams, and study goals.

### 6. 💎 Freemium Subscription Model
- **Free Plan**: Free forever. Attendance calculator, CGPA calculator, Timetable, Assignment manager, Resource Hub, and 10 daily AI queries.
- **Student Plus (₹199/mo)**: AI Academic Tutor, PDF Document Summarizer, MCQ Quiz Generator, Flashcard decks, and 50 daily AI queries.
- **Student Pro (₹399/mo)**: Everything in Plus + AI Exam Prep Mode, University Answer Generator, Personalized study recommendations, and 500 daily AI queries.
- Simulated Razorpay payment checkout with instant sandbox activation.

### 7. 🛡️ Admin Dashboard
- Total registered students, daily active users, subscription analytics, user directory, and resource content moderation queue.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, Multer, `pdf-parse` |
| **Database** | MySQL 8.0 DDL (`database/schema.sql`) with seamless SQLite zero-setup fallback |
| **Mobile** | React Native with Expo (Android / iOS) located in `mobile/` |
| **AI Integration** | OpenAI GPT-4o API integration with built-in Academic Intelligence engine |

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server
The server starts on port `5000` with out-of-the-box SQLite demo data, and can connect to MySQL 8.0 anytime via `.env`:
```bash
cd server
npm install
npm start
```

### 2. Start the Responsive Web Application
The web app runs on port `3000` with Vite HMR:
```bash
cd client
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 3. Run the Android Mobile Application
```bash
cd mobile
npm install
npx expo start
```
Press `a` to open in your Android Emulator or scan the QR code with **Expo Go** on your physical phone!

---

## 👥 Demo Test Accounts

You can test any role instantly using the **⚡ 1-Click Persona Login** on the login page or in the navbar:

| Persona | Email | Password | Role / Plan |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `student@campusmate.ai` | `campusmate123` | Student (**Free Tier**) |
| **Priya Patel** | `pro@campusmate.ai` | `campusmate123` | Student (**Pro Tier**) |
| **Dr. Sarah Jenkins** | `admin@campusmate.ai` | `campusmate123` | **Platform Administrator** |

---

## 🗄️ Database Schema & MySQL Setup

Full production MySQL 8.0 DDL is located in [`database/schema.sql`](database/schema.sql) and initial seed data in [`database/seed.sql`](database/seed.sql).

To switch from SQLite to MySQL:
1. Create a MySQL database:
   ```sql
   CREATE DATABASE campusmate;
   ```
2. In `server/.env`, set:
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=campusmate
   ```
3. Restart the server!

---

## 📄 License
MIT License. Built with ❤️ for university students everywhere.

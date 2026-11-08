# CampusMate AI - Android Mobile Application

This directory contains the cross-platform React Native & Expo mobile application for **CampusMate AI**, sharing the identical backend REST API and database as the responsive web client.

## Features
- **Dashboard**: Personalized welcome, today's lecture schedule, real-time attendance percentage, and exam countdown.
- **Attendance Manager**: Subject-wise attendance calculation, safe bunk limit vs. must-attend warnings, and instant present/absent logger.
- **AI Study Tutor**: Mobile academic companion for university questions, step-by-step problem explanations, and viva tips.
- **Timetable Matrix**: Lecture rooms, faculty names, and class schedules.
- **Connected API**: Direct connection to the Node.js/Express backend (`/api`).

## How to Run the Android App

1. Make sure dependencies are installed:
   ```bash
   cd mobile
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. To run directly on an Android device or emulator:
   - Press `a` in the terminal to launch the Android emulator.
   - Or scan the displayed QR code with the **Expo Go** app on your Android phone!

4. Network Configuration:
   - On the Android Emulator, `10.0.2.2` maps to your development PC's `localhost`.
   - On a physical Android device, update `API_BASE_URL` in `App.tsx` with your local Wi-Fi IP address (e.g., `http://192.168.1.X:5000/api`).

# CashPilot (Firebase + React)

This is a simple personal finance tracker built with React, Vite, and Firebase (Auth + Firestore).

## Features

- Email/password registration and login
- Password reset via email
- Add, edit, and delete income/expense transactions
- Monthly budget with over-budget warning
- Dashboard with summaries and charts
- Export transactions as CSV or PDF

## Getting Started

```bash
npm install
npm run dev
```

Make sure you have created the Firebase project and enabled:

- Authentication (Email/Password)
- Firestore Database (in production or test mode)
- Analytics (optional)

The Firebase config in `src/firebase.js` already uses your provided credentials. If you regenerate them, update that file.

## Firebase Hosting (optional)

```bash
npm install -g firebase-tools
firebase login
firebase init
# choose "Hosting" and use `npm run build` as the build command, `dist` as the public directory
firebase deploy
```

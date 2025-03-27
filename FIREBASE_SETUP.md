# Firebase Setup Guide for Vote Counter Application

This guide will help you set up Firebase for the Vote Counter application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "vote-counter")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click "Create project"

## Step 2: Set Up Firebase Authentication

1. In the Firebase Console, select your project
2. Click on "Authentication" in the left sidebar
3. Click on "Get started"
4. Enable the "Email/Password" sign-in method
5. (Optional) Enable other sign-in methods as needed

## Step 3: Set Up Firebase Realtime Database

1. In the Firebase Console, select your project
2. Click on "Realtime Database" in the left sidebar
3. Click on "Create database"
4. Choose a location for your database
5. Start in "test mode" for development (you'll set up proper security rules later)
6. Click "Enable"

## Step 4: Register Your Web App

1. In the Firebase Console, select your project
2. Click on the web icon (</>) on the project overview page
3. Register your app with a nickname (e.g., "vote-counter-web")
4. (Optional) Set up Firebase Hosting
5. Click "Register app"
6. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in the root of your project
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
```

## Step 6: Initialize Firebase in Your App

The application is already set up to initialize Firebase using the environment variables. The configuration is in `src/firebaseConfig.ts`.

## Step 7: Initialize Firebase with Sample Data

1. Install the required dependencies:
   ```bash
   npm install dotenv
   ```

2. Run the initialization script:
   ```bash
   npm run init-firebase
   ```

This script will upload the sample location data from `src/data/locations.json` to your Firebase Realtime Database.

## Step 8: Set Up Firebase Security Rules

For production, you should set up proper security rules for your Firebase Realtime Database:

```json
{
  "rules": {
    "votes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "locations": {
      ".read": "auth != null",
      ".write": "auth.token.admin === true"
    }
  }
}
```

## Step 9: Deploy to Firebase Hosting (Optional)

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```

4. Build your Next.js app:
   ```bash
   npm run build
   ```

5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

## Step 10: Set Up Firebase Admin SDK (For Backend Functions)

For admin operations like user management, you'll need to set up the Firebase Admin SDK. This is beyond the scope of this guide but can be added later as needed.

## Troubleshooting

- If you encounter CORS issues, make sure your Firebase project has the correct domains whitelisted in the Authentication settings.
- If authentication is not working, check that you've enabled the Email/Password sign-in method.
- If database operations fail, check your security rules and make sure they allow the operations you're trying to perform.
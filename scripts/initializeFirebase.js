// This script initializes the Firebase Realtime Database with sample data
// Run this script after setting up your Firebase project

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Load location data from JSON file
const locationsPath = path.join(__dirname, '../src/data/locations.json');
const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Function to upload data to Firebase
async function uploadData() {
  try {
    // Upload regions
    for (const region of locationsData.regions) {
      await set(ref(db, `locations/regions/${region.id}`), region);
      console.log(`Uploaded region: ${region.name}`);
    }

    // Upload cities
    for (const city of locationsData.cities) {
      await set(ref(db, `locations/cities/${city.id}`), city);
      console.log(`Uploaded city: ${city.name}`);
    }

    // Upload KZAZs
    for (const kzaz of locationsData.kzaz) {
      await set(ref(db, `locations/kzaz/${kzaz.id}`), kzaz);
      console.log(`Uploaded KZAZ: ${kzaz.name}`);
    }

    console.log('All location data uploaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  }
}

// Run the upload function
uploadData();
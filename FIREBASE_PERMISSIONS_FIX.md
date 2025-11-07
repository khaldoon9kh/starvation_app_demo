# Quick Firebase Setup Guide

## The Issue
You're getting "Missing or insufficient permissions" because your Firebase Firestore database has default security rules that block all access.

## Quick Fix - Set Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **starvation-app**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Replace the existing rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents for the mobile app
    match /{document=**} {
      allow read: if true;
    }
  }
}
```

6. Click **Publish** to save the changes

## What This Does
- Allows **read-only** access to all Firestore collections
- Your app can now load categories, subcategories, glossary, diagrams, and templates
- Write operations are still blocked (which is good for the mobile app)

## Alternative: Use Test Mode (Temporary)
If you want to allow both read and write access temporarily:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: These rules allow anyone to read and write to your database
    // Only use for development/testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Storage Rules (Optional)
If you're using Firebase Storage for images/PDFs:

1. Go to **Storage** in Firebase Console
2. Click on **Rules** tab
3. Use these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
```

## After Setting Up Rules
1. The app will automatically connect to Firebase
2. The error will disappear
3. You'll see your actual Firebase data instead of fallback data
4. The HomeScreen will show real statistics

## Note
The app currently includes fallback data so it will work even without Firebase configuration, but you'll see placeholder content until you set up the proper rules.
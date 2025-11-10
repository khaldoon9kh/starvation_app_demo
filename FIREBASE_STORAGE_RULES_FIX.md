
## Solution

You need to update your Firebase Storage security rules to allow public read access with authenticated write access.

### Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project: **starvation-app**
3. Go to **Storage** (left sidebar)
4. Click on **Rules** tab

### Step 2: Replace Rules with This Configuration

```firebase
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Diagrams - public read, authenticated write
    match /diagrams/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
    
    // Templates - public read, authenticated write
    match /templates/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
    
    // All other paths - deny access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
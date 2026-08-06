# Firebase Configuration Instructions

To use this app with Firebase, you need to:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database
3. Enable Storage (for images and PDFs)
4. Get your Firebase configuration
5. Update src/services/firebase.js with your configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Firestore Collections Structure

Your Firestore database should have these collections:

### categories
```javascript
{
  title: "Law on Starvation",
  titleArabic: "قانون الجوع",
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### subcategories
```javascript
{
  title: "ICL Framework",
  titleArabic: "إطار القانون الجنائي الدولي",
  categoryId: "category-id",
  parentSubcategoryId: null, // or parent subcategory ID for level 2
  level: 1, // 1 for subcategory, 2 for sub-subcategory
  contentEn: "English content here...",
  contentAr: "المحتوى العربي هنا...",
  hasContent: true,
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### glossary
```javascript
{
  term: "Starvation",
  termArabic: "الجوع",
  definition: "The deliberate deprivation of food...",
  definitionArabic: "الحرمان المتعمد من الطعام...",
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### diagrams
```javascript
{
  title: "Legal Framework Diagram",
  titleArabic: "مخطط الإطار القانوني",
  description: "Visual representation of...",
  descriptionArabic: "التمثيل البصري لـ...",
  imageUrl: "https://firebasestorage.googleapis.com/...",
  imageFileName: "diagram_123_timestamp.png",
  category: "Legal Framework",
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### templates
```javascript
{
  title: "Witness Risk Checklist",
  titleArabic: "قائمة مراجعة مخاطر الشاهد",
  description: "A checklist for...",
  descriptionArabic: "قائمة مراجعة لـ...",
  category: "Basic Interview",
  pdfUrl: "https://firebasestorage.googleapis.com/...",
  pdfFileName: "template_123_timestamp.pdf",
  pdfOriginalName: "witness-risk-checklist.pdf",
  order: 1,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## Security Rules

Set up Firestore security rules to allow read access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all collections for the mobile app
    match /{document=**} {
      allow read: if true;
    }
  }
}
```

## Storage Rules

Set up Storage security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
    }
  }
}
```
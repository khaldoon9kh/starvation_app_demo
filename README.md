# GRC Starvation Toolkit

A bilingual (English/Arabic) React Native mobile application based on the Global Rights Compliance (GRC) Starvation Training Manual (Second Edition, 2022). This app provides legal professionals, investigators, and practitioners with a portable toolkit for identifying, investigating, and addressing starvation-related crimes and violations under international law.

## 📱 Features

### Core Functionality
- **Offline-First**: Download all content once, use anywhere without internet
- **Bilingual Support**: Full English and Arabic translations with RTL support
- **Search**: Global search across all articles, templates, and diagrams
- **Bookmarks**: Save articles for quick offline access
- **Content Updates**: Download new content from Firebase when connected

### Main Sections

| Tab | Description |
|-----|-------------|
| 🏠 **Home** | Welcome screen with app overview and quick links |
| 📚 **Library** | Legal frameworks organized by categories and subcategories |
| 💾 **Saved** | Bookmarked articles for quick access |
| 📋 **Templates** | Investigation forms, checklists, and practical tools |

### Content Areas
- **Law on Starvation**: International criminal, humanitarian, and human rights law frameworks
- **Basic Investigation Standards**: Essential investigative principles including OSINT methods
- **Remedies**: Guidance for international courts, UN bodies, and sanctions regimes
- **Starvation-Related Crimes**: Analysis of genocide, crimes against humanity, and war crimes
- **Templates & Checklists**: Practical investigation and interview tools
- **Diagrams**: Visual aids and flowcharts for legal analysis
- **Glossary**: Comprehensive legal terminology reference

### Additional Features
- **Diagrams Library**: Visual flowcharts with download/share functionality
- **Glossary**: Legal terms with definitions and in-content term highlighting
- **User Guide**: In-app navigation instructions
- **Settings**: Language toggle, content download/update, cache management

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.79.6 | Mobile framework |
| Expo | 53.0.0 | Development platform |
| Firebase | 10.7.0 | Backend (Firestore + Storage) |
| React Navigation | 6.x | Navigation (Stack + Bottom Tabs) |
| i18next | 25.x | Internationalization |
| AsyncStorage | 2.1.2 | Local data persistence |
| expo-file-system | 18.x | File management |
| expo-media-library | 17.x | Photo library access |
| expo-sharing | 13.x | Share functionality |

## 📁 Project Structure

```
├── App.jsx                    # Main app entry with navigation
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
├── src/
│   ├── components/
│   │   ├── MenuModal.jsx      # Hamburger menu overlay
│   │   └── SearchModal.jsx    # Global search modal
│   ├── data/
│   │   └── appData.js         # Fallback static data
│   ├── hooks/
│   │   └── useFirebaseData.js # Firebase data hooks
│   ├── i18n/
│   │   ├── i18n.js            # i18next configuration
│   │   └── locales/
│   │       ├── en.json        # English translations
│   │       └── ar.json        # Arabic translations
│   ├── screens/
│   │   ├── HomeScreen.jsx         # Main welcome screen
│   │   ├── LibraryScreen.jsx      # Category browser
│   │   ├── ArticleScreen.jsx      # Article viewer with markdown
│   │   ├── SavedScreen.jsx        # Bookmarked items
│   │   ├── TemplatesScreen.jsx    # Template categories
│   │   ├── CategoryTemplatesScreen.jsx  # Templates by category
│   │   ├── DiagramsScreen.jsx     # Diagrams gallery
│   │   ├── GlossaryScreen.jsx     # Legal terms glossary
│   │   ├── SettingsScreen.jsx     # App settings & downloads
│   │   ├── SplashScreen.jsx       # Initial loading screen
│   │   ├── LandingScreen.jsx      # First-time user onboarding
│   │   ├── AboutScreen.jsx        # About the app
│   │   ├── ContactScreen.jsx      # Contact information
│   │   ├── CopyrightScreen.jsx    # Copyright notice
│   │   ├── DisclaimerScreen.jsx   # Legal disclaimer
│   │   └── UserGuideScreen.jsx    # How to use the app
│   └── services/
│       ├── firebase.js            # Firebase initialization
│       ├── dataService.js         # Data fetching & caching
│       ├── dataStore.js           # Local storage management
│       └── templateManager.js     # Template file handling
└── assets/
    └── images/
        ├── icon-1024.png          # App icon (1024x1024)
        └── image.png              # Splash screen image
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd starvation_app_demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app

## 📦 Building for Production

### Android (Google Play Store)

```bash
# Build Android App Bundle
npx eas build --platform android --profile production

# Submit to Play Store
npx eas submit --platform android --latest
```

### iOS (App Store)

```bash
# Build iOS Archive
npx eas build --platform ios --profile production

# Submit to App Store
npx eas submit --platform ios --latest
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore and Storage
3. Update `src/services/firebase.js` with your config
4. See `FIREBASE_SETUP.md` for detailed instructions

### Environment
- **EAS Project ID**: Configured in `app.json` under `extra.eas.projectId`
- **Bundle IDs**: 
  - iOS: `com.grc.starvation.toolkit`
  - Android: `com.grc.starvation.toolkit`

## 🌐 Internationalization

The app supports:
- **English** (default)
- **Arabic** (with RTL layout support)

Language can be changed in Settings or automatically detected from device locale.

Translation files are located in `src/i18n/locales/`.

## 📄 Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Firebase      │────▶│   dataService   │────▶│   AsyncStorage  │
│   (Firestore)   │     │   (fetch/cache) │     │   (local cache) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   App Screens   │
                        │   (offline-     │
                        │    capable)     │
                        └─────────────────┘
```

## 📋 App Store Listings

### Short Description (80 chars)
```
Legal toolkit for investigating starvation crimes under international law.
```

### Privacy Policy
See `privacy-policy.html` for the full privacy policy.

## 🤝 Contributing

This project was developed under GRC's "Accountability for Mass Starvation: Testing the Limits of the Law" project, funded by the Kingdom of The Netherlands' Ministry of Foreign Affairs.

## 📜 License

© 2026 Global Rights Compliance (GRC). All rights reserved.

## 🔗 Links

- **Website**: [starvationaccountability.org](https://starvationaccountability.org/)
- **Training Manual**: [Starvation Training Manual](https://starvationaccountability.org/resources/starvation-training-manual/)

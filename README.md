# GRC Starvation Accountability App

A React Native mobile application based on the Global Rights Compliance (GRC) Starvation Training Manual (Second Edition, 2022). This app provides legal professionals and practitioners with a portable toolkit for identifying, investigating, and addressing starvation-related crimes and violations.

## Features

### 📱 Main Navigation
- **Home**: Overview and app description
- **Library**: Legal frameworks and resources with expandable sections
- **Saved**: Bookmarked articles for quick access
- **Templates**: Investigation forms and checklists with export functionality

### 🔍 Key Sections
- **Law on Starvation**: International criminal, humanitarian, and human rights law frameworks
- **Basic Investigation Standards**: Essential principles and techniques
- **Remedies**: Guidance for courts and UN bodies
- **Starvation-Related Crimes**: Analysis of related crimes
- **Templates & Checklists**: Practical investigation tools

### ✨ Key Features
- Offline functionality
- Search within articles
- Save/bookmark articles
- Export templates and checklists
- Expandable content sections
- Material Design UI components

## Tech Stack

- **Framework**: React Native 0.72.6
- **Navigation**: React Navigation 6.x (Bottom Tabs + Stack)
- **Icons**: React Native Vector Icons (Material Design)
- **UI**: Custom components with Material Design principles

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.js          # App overview and description
│   ├── LibraryScreen.js       # Legal frameworks and resources
│   ├── SavedScreen.js         # Bookmarked articles
│   ├── TemplatesScreen.js     # Investigation templates
│   ├── ExportScreen.js        # Template export options
│   └── ArticleScreen.js       # Individual article view
├── data/
│   └── appData.js            # App content and data
└── components/               # Reusable components (future)
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Install iOS dependencies** (iOS only):
   ```bash
   cd ios && pod install
   ```

3. **Run the app**:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

## App Screenshots Match

The app recreates the UI shown in the provided screenshots:

- ✅ Header with Arabic text and green icons
- ✅ Bottom tab navigation with 4 tabs
- ✅ Templates screen with card layout
- ✅ Export selection screen
- ✅ Saved items with green accent borders
- ✅ Library with expandable sections and color-coded items
- ✅ Home screen with app overview text

## Content Areas

### Legal Frameworks
- ICL Framework (International Criminal Law)
- IHL Framework (International Humanitarian Law)
- IHRL Framework (International Human Rights Law)
- Human Rights Obligations
- Starvation and Rights contexts

### Investigation Tools
- Witness Risk Checklist
- Modes of Liability Checklist
- Risk Assessment Tool
- Trauma Victim Interview Guide
- Evidence Collection tools

### Export Functionality
Templates can be categorized and exported by:
- All Templates and Checklists
- Basic Interview tools
- Special Interview tools
- Evidence Collection
- Investigation Preparation
- Forum Shopping

## Design System

### Colors
- **Primary Green**: #4CAF50 (headers, icons, accents)
- **Blue**: #2196F3 (law-related sections)
- **Background**: #f5f5f5 (light gray)
- **Cards**: #fff (white with shadows)

### Typography
- **Titles**: 18px, bold
- **Body text**: 16px, regular
- **Descriptions**: 14px, gray

## Future Enhancements

- [ ] Search functionality
- [ ] Offline data storage
- [ ] PDF export capability
- [ ] Multi-language support
- [ ] User annotations
- [ ] Sync capabilities

## License

This app is based on the GRC Starvation Training Manual and is intended for educational and professional use in international criminal law and human rights practice.

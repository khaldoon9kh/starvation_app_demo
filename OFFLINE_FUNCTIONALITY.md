# Offline Functionality & Data Management

## Overview
The app implements a smart offline-first architecture that:
1. **First Launch**: Downloads all content from Firebase and caches it locally
2. **Subsequent Launches**: Uses cached data without fetching from Firebase
3. **Manual Refresh**: Users can update content on-demand from Settings

## Data Flow

### 1. First App Launch (No Cache)

```
App Starts
    ↓
SplashScreen checks for cached status
    ↓
No 'app_content_status' found in AsyncStorage
    ↓
Navigate to LandingScreen
    ↓
User clicks "Settings" → SettingsScreen
    ↓
User clicks "DOWNLOAD" → handleDownloadContent()
    ↓
getAllContentForCache() fetches from Firebase:
  - Categories
  - Subcategories
  - Glossary Terms
  - Diagrams
  - Templates
    ↓
Save to AsyncStorage:
  - CONTENT_DATA_KEY: Full content object
  - CONTENT_STATUS_KEY: 'downloaded'
    ↓
Navigate to MainTabs (Home Screen)
    ↓
useFirebaseData() initializes dataStore
    ↓
dataStore.initialize() → loadCachedData()
    ↓
App loads from cache (NO Firebase calls)
```

### 2. Second App Launch (With Cache)

```
App Starts
    ↓
SplashScreen checks for cached status
    ↓
Finds CONTENT_STATUS_KEY = 'downloaded'
    ↓
Navigate directly to MainTabs (Home Screen)
    ↓
useFirebaseData() initializes dataStore
    ↓
dataStore.initialize() → loadCachedData()
    ↓
App loads from cache (NO Firebase calls)
```

### 3. Manual Content Refresh

```
User on Home Screen
    ↓
Navigate to Settings
    ↓
See "Content is up to date" with UPDATE CONTENT button
    ↓
Click "UPDATE CONTENT" → handleRefreshContent()
    ↓
getAllContentForCache() fetches fresh from Firebase
    ↓
Update AsyncStorage with new data
    ↓
Show success message
    ↓
Content is now refreshed (cached data updated)
```

## Key Files & Functions

### AsyncStorage Keys
- **`app_content_status`**: Tracks if content is downloaded
  - Values: `'none'` (default), `'downloaded'`
  
- **`app_content_data`**: Full cached content object
  - Structure: `{ categories, subcategories, glossary, diagrams, templates, lastUpdated }`

### Data Store (`src/services/dataStore.js`)

**`loadCachedData()`**
- Reads from AsyncStorage
- Populates store with cached data
- Returns `true` if cache found, `false` otherwise

**`initialize()`**
- Called on app startup
- Loads cached data first
- Does NOT fetch from Firebase if cache exists
- Returns immediately after loading cache

**`refresh()`** (NEW)
- Manually triggered from Settings screen
- Calls `loadInitialData()` to fetch fresh content
- Updates cache with new data
- Used for content updates

**`loadInitialData()`**
- Fetches all data from Firebase
- Saves to both dataStore and cache
- Only called during:
  1. Initial download (SettingsScreen)
  2. Manual refresh (SettingsScreen)

### Service (`src/services/dataService.js`)

**`getAllContentForCache()`**
- Fetches all collections from Firebase in parallel:
  - getCategories()
  - getAllSubcategories()
  - getGlossaryTerms()
  - getDiagrams()
  - getTemplates()
- Returns complete object ready for caching

### Screens

**`SplashScreen`**
- Checks `app_content_status` from AsyncStorage
- Routes: 
  - If `'downloaded'` → MainTabs (Main App)
  - Else → Landing (Download Prompt)

**`LandingScreen`**
- Shows when no content cached
- Button navigates to SettingsScreen with `showDownloadPrompt=true`

**`SettingsScreen`**
- **Initial State** (No Content):
  - Shows "DOWNLOAD" button
  - Clicking triggers `handleDownloadContent()`
  - After success: Navigate to MainTabs
  
- **Downloaded State** (Content Exists):
  - Shows "Content is up to date"
  - Displays "UPDATE CONTENT" button (orange)
  - Clicking triggers `handleRefreshContent()`
  - Updates cache with fresh data

## Architecture Benefits

1. **Offline Support**: App works without internet after first download
2. **Fast Startup**: No Firebase calls on subsequent launches
3. **Controlled Updates**: Users decide when to refresh content
4. **Complete Data Download**: Templates included (fixes issue #1)
5. **No Continuous Syncing**: DataStore doesn't set up subscriptions (fixes issue #2)
6. **Update Capability**: Settings page allows manual refresh (fixes issue #3)

## Cache Structure in AsyncStorage

```javascript
{
  app_content_status: "downloaded"
  
  app_content_data: {
    categories: [
      { id, title, titleAr, order, ... },
      ...
    ],
    subcategories: [
      { id, categoryId, titleEn, titleAr, level, contentEn, contentAr, ... },
      ...
    ],
    glossary: [
      { id, reference, term, termArabic, definition, definitionArabic, ... },
      ...
    ],
    diagrams: [
      { id, title, titleAr, imageUrl, description, ... },
      ...
    ],
    templates: [
      { id, title, titleArabic, description, pdfUrl, category, ... },
      ...
    ],
    lastUpdated: "2025-11-10T13:31:35.000Z"
  }
}
```

## Important Notes

1. **First Download Includes Everything**
   - Templates are now included in `getAllContentForCache()`
   - TemplatesScreen won't show "download again" prompt

2. **No Background Syncing**
   - DataStore doesn't set up Firebase subscriptions
   - App is truly offline-first
   - Updates only happen via manual refresh button

3. **Download Data Stays in Cache**
   - Clearing app cache will reset to no-content state
   - On production, consider warning users about this

4. **Language Support**
   - Content downloaded in all languages
   - LanguageScreen just toggles display language
   - No additional downloads needed

## Testing the Flow

1. **First Launch Test**:
   - Delete app data
   - Launch app
   - Should show LandingScreen
   - Click Settings → Download
   - Should navigate to MainTabs
   - Check AsyncStorage: `app_content_status` = 'downloaded'

2. **Second Launch Test**:
   - Kill and relaunch app
   - Should skip LandingScreen
   - Go directly to MainTabs (Home)
   - Check DevTools: No Firebase calls

3. **Update Content Test**:
   - On Home, go to Settings
   - See "Content is up to date"
   - Click "UPDATE CONTENT"
   - Verify new data is fetched and stored
   - App continues to work with updated cache

4. **Offline Test**:
   - Download content
   - Turn off device internet
   - Relaunch app
   - App should work with cached data
   - Settings screen shows last update time

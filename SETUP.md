# Setup Instructions

## Prerequisites

Before running this React Native app, you need to have the following installed:

### 1. Node.js and npm
- Download and install Node.js from https://nodejs.org/
- This will also install npm (Node Package Manager)
- Verify installation by running:
  ```
  node --version
  npm --version
  ```

### 2. React Native CLI
- Install globally:
  ```
  npm install -g react-native-cli
  ```

### 3. Development Environment

#### For Android Development:
- Install Android Studio
- Set up Android SDK
- Configure environment variables (ANDROID_HOME)
- Enable USB debugging on your device or set up an emulator

#### For iOS Development (Mac only):
- Install Xcode from Mac App Store
- Install Xcode Command Line Tools
- Install CocoaPods: `sudo gem install cocoapods`

## Running the App

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Start Metro bundler**:
   ```
   npm start
   ```

3. **Run on device/emulator**:
   ```
   # Android
   npm run android
   
   # iOS (Mac only)
   npm run ios
   ```

## Alternative: Expo Development

For easier setup, you can also use Expo:

1. Install Expo CLI:
   ```
   npm install -g expo-cli
   ```

2. Create Expo version of the app:
   ```
   expo init StarvationApp --template blank
   ```

3. Copy the source files to the new Expo project

## Troubleshooting

- Make sure all dependencies are properly installed
- Check that your development environment is set up correctly
- For Android, ensure the emulator is running or device is connected
- For iOS, make sure Xcode is properly configured

# The Well App

A Christian dating app built with React Native Expo for iOS, Android, and Web by Anointed Innovations.

**Tagline:** "Where Kingdom Singles Meet"

## Development Setup

### Prerequisites

- Node.js 18+ installed
- Android Studio (for Android development and testing)
- VS Code (recommended IDE)
- EAS CLI: `npm install -g eas-cli`

### Installation

\`\`\`bash
# Install dependencies
npm install

# Login to Expo account (required for EAS)
eas login

# Configure EAS for your project
eas build:configure
\`\`\`

### Environment Variables

Create a `.env` file in the root directory (use `.env.example` as template):

\`\`\`bash
# API Configuration
API_URL=http://localhost:5000          # For Android emulator: http://localhost:5000
API_VERSION=v1

# Socket.io Configuration
SOCKET_URL=http://localhost:5000       # For Android emulator: http://localhost:5000

# Environment
NODE_ENV=development
\`\`\`

**Important for Android Emulator:**
- Use `http://localhost:5000` instead of `http://localhost:5000` to connect to your local backend
- `10.0.2.2` is the special IP that Android emulator uses to access the host machine's localhost

**For Physical Android Device:**
- Use your computer's local IP address (e.g., `http://192.168.1.100:5000`)
- Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Ensure your device and computer are on the same network

### Backend Server

The app connects to a separate Node.js/Express backend server located at `/src/server.js` in your backend project.

**Starting the Backend:**

\`\`\`bash
# In your backend project directory
cd path/to/backend
npm install
npm start
\`\`\`

The backend should be running on `http://localhost:5000` before starting the mobile app.

### Development Workflow

#### Local Development with Android Studio

\`\`\`bash
# Start the Expo development server
npm start

# In the Expo Dev Tools, press 'a' to open in Android emulator
# Or scan QR code with Expo Go app on physical Android device
\`\`\`

#### Building with EAS

\`\`\`bash
# Development build (for testing on physical device)
eas build --profile development --platform android

# Preview build (internal testing APK)
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
\`\`\`

#### Running on Android Studio Emulator

1. Open Android Studio
2. Start an Android Virtual Device (AVD)
3. Ensure backend server is running
4. Run `npm start` in your project directory
5. Press `a` in the terminal to launch on Android emulator

#### Running on Physical Android Device

1. Install Expo Go from Google Play Store
2. Ensure backend server is accessible from your device
3. Update `.env` with your computer's local IP
4. Run `npm start`
5. Scan the QR code with Expo Go app

### Web Development

\`\`\`bash
# Run on web browser
npm run web
\`\`\`

## Features

- **Authentication Flow**: Splash screen with login/signup, complete onboarding experience
- Cross-platform support (iOS, Android, Web)
- Video story recording and playback
- AI-powered matching
- Equally Yoked spiritual compatibility assessment
- Faith-based content and daily devotionals
- Real-time messaging with Socket.io
- Prayer wall and community events
- User authentication and profile management

## User Flow

### Authentication & Onboarding

1. **Splash Screen** (`app/index.tsx`)
   - Displays The Well logo and tagline
   - Options to "Create Account" or "Sign In"
   - Auto-redirects authenticated users based on profile completion

2. **Sign Up** (`app/auth/signup.tsx`)
   - Collects: First name, last name, email, password, date of birth, gender
   - Validates age (18+) and password strength
   - Creates account and stores auth token

3. **Sign In** (`app/auth/login.tsx`)
   - Email and password authentication
   - "Forgot Password" flow available
   - Auto-redirects based on profile completion status

4. **Onboarding** (`app/onboarding.tsx`)
   - 5-step introduction to app features
   - Explains AI matching, Equally Yoked questionnaire, video profiles, and community
   - Can skip to start journey

5. **Start Journey** (`app/start-journey.tsx`)
   - Step 1: Relationship goals, denomination, church attendance
   - Step 2: Location, age range preferences, maximum distance
   - Saves preferences and marks profile as complete
   - Redirects to main app tabs

6. **Main App** (`app/(tabs)`)
   - Discover, Matches, AI Match, Equally Yoked, Faith, Profile tabs

### Navigation Logic

The app uses `AuthContext` to manage authentication state and navigation:

- **Unauthenticated users** → Splash screen with login/signup options
- **Authenticated + incomplete profile** → Onboarding → Start Journey
- **Authenticated + complete profile** → Main app tabs

## Project Structure

\`\`\`
thewell/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with SafeAreaProvider & AuthProvider
│   ├── index.tsx          # Splash screen with login/signup
│   ├── auth/              # Authentication screens
│   │   ├── _layout.tsx    # Auth stack layout
│   │   ├── login.tsx      # Login screen
│   │   ├── signup.tsx     # Signup screen
│   │   └── forgot-password.tsx  # Password reset
│   ├── onboarding.tsx     # Onboarding flow (5 steps)
│   ├── start-journey.tsx  # Initial preferences setup
│   ├── (tabs)/            # Main app tabs
│   │   ├── _layout.tsx    # Tab navigator
│   │   ├── index.tsx      # Discover tab
│   │   ├── matches.tsx    # Matches tab
│   │   ├── ai-match.tsx   # AI Match tab
│   │   ├── equally-yoked.tsx  # Questionnaire tab
│   │   ├── faith.tsx      # Faith content tab
│   │   └── profile.tsx    # User profile tab
│   └── profile/           # Profile screens
│       └── video.tsx      # Video recording
├── components/            # Reusable components
│   ├── ui/               # UI primitives (Button, Card, etc.)
│   ├── video-player.tsx  # Video playback component
│   ├── video-recorder.tsx # Video recording component
│   └── equally-yoked-questionnaire.tsx  # Questionnaire component
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication & navigation logic
├── lib/                  # Utilities and services
│   ├── api-client.ts     # API client with auth
│   ├── constants.ts      # API endpoints and config
│   ├── utils.ts          # Utility functions
│   └── services/         # API service modules
│       ├── auth.service.ts      # Login, register, logout
│       ├── user.service.ts      # Profile, preferences, questionnaire
│       ├── match.service.ts     # Discover, like, pass, matches
│       ├── message.service.ts   # Conversations, messages
│       ├── media.service.ts     # Video/photo uploads
│       ├── prayer.service.ts    # Prayer requests
│       ├── event.service.ts     # Community events
│       └── socket.service.ts    # Real-time messaging
├── hooks/                # Custom React hooks
│   └── use-socket.ts     # Socket.io hook
├── assets/               # Images, fonts, icons
│   ├── the-well-logo.jpg # App logo
│   ├── icon.jpg          # App icon
│   ├── splash.jpg        # Splash screen
│   └── ...
├── global.css            # Global styles with The Well theme
├── tailwind.config.js    # Tailwind configuration
├── eas.json             # EAS build configuration
├── app.json             # Expo configuration
└── package.json         # Dependencies
\`\`\`

## Design System

### The Well Brand Colors

- **Primary (Ocean Blue)**: `#0891B2` - Represents "The Well" water theme
- **Secondary (Coral)**: Warm coral/peach - Love and warmth
- **Accent (Golden Amber)**: Divine light and faith
- **Background**: Soft cream/off-white for calming feel
- **Lavender**: Peace and spirituality

### Typography

- Clean, modern sans-serif fonts
- Generous whitespace for readability
- Text balance for optimal line breaks

### Design Principles

- Calming and cool vibe with water theme elements
- Vibrant and eye-catching (not plain)
- Faith-centered visual language
- Accessible and inclusive design

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- EAS (Expo Application Services) for builds
- NativeWind for styling (Tailwind CSS)
- TypeScript for type safety
- Expo Camera for video recording
- Expo AV for video playback
- Socket.io for real-time messaging
- AsyncStorage for local data persistence

## API Integration

The app integrates with the backend API through service modules:

- **Authentication**: Login, register, logout, password reset
- **User Management**: Profile CRUD, photo uploads, preferences
- **Matching**: Get matches, like/pass users, compatibility scoring
- **Messaging**: Real-time chat with Socket.io
- **Prayers**: Community prayer wall
- **Events**: Christian community events and RSVP
- **Media**: File uploads for photos and videos

All API calls include automatic authentication token handling via AsyncStorage.

## Android-Specific Configuration

The app is configured with the following Android permissions:
- Camera access for video recording
- Microphone access for audio recording
- Internet access for API calls
- Storage access for media files
- Package name: `com.anointedinnovations.thewell`

## Troubleshooting

### Backend Connection Issues
- Verify backend server is running on port 5000
- Check `.env` file has correct API_URL for your setup
- For Android emulator, use `http://localhost:5000`
- For physical device, use your computer's local IP address
- Ensure firewall allows connections on port 5000

### Android Emulator Issues
- Ensure Android Studio is properly installed
- Check that an AVD is created and running
- Verify USB debugging is enabled for physical devices

### EAS Build Issues
- Ensure you're logged in: `eas login`
- Check your Expo account has proper permissions
- Review build logs: `eas build:list`

### Socket.io Connection Issues
- Check that Socket.io server is running
- Verify SOCKET_URL in `.env` matches your backend
- Check browser/app console for connection errors

## Company

Built by Anointed Innovations

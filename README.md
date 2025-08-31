
# Friend-SOS - Personal Emergency Alert PWA

![GitHub repo size](https://img.shields.io/github/repo-size/your-username/friend-sos?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/friend-sos?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)end SOS - Personal Emergency Alert PWA

![GitHub repo size](https://img.shields.io/github/repo-size/your-username/friend-sos?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/friend-sos?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Friend SOS** is a modern, installable Progressive Web App (PWA) designed to provide a fast and simple way to send a detailed emergency alert to a predefined list of contacts. It leverages the Google Gemini API to intelligently craft a clear, concise SOS message, and uses your device's native capabilities to dispatch it instantly.

---

### [🚀 Live Demo (Link to your deployed app)](#)

---

## ✨ Key Features

### 🆘 Core Emergency Features
- **🤖 Multi-Provider AI Alert Generation:** Choose between Gemini, OpenAI, and Anthropic to transform your message into a well-formatted, urgent alert.
- **📲 Multi-Provider SMS Integration:** Support for multiple SMS providers (Twilio, MessageBird) with automatic fallback for enhanced reliability.
- **🗣️ Voice Commands:** Trigger alerts, respond to check-ins, and control the app using natural voice commands (e.g., "Friend SOS emergency").
- **📍 Enhanced Location Services:**
  - Real-time location tracking with periodic updates
  - Reverse geocoding for human-readable addresses
  - Nearby emergency services finder (hospitals, police, fire stations)
  - Static and interactive maps
  - Emergency service contact information

### 👥 Contact Management
- **📇 Comprehensive Contact System:**
  - Contact groups and lists
  - Priority levels
  - Custom notes and tags
  - Import/export functionality
- **✅ Real-time Contact Validation:** Immediate visual feedback for valid emails and phone numbers
- **👥 Emergency Lists:** Create and manage groups of contacts for different scenarios
- **📊 Contact Analytics:** Track message history and response times

### ⏰ Check-in System
- **🔄 Automated Check-ins:**
  - Scheduled periodic check-ins
  - Customizable intervals and duration
  - Multiple notification attempts
  - Escalation system for missed check-ins
- **� Smart Escalation:**
  - Custom escalation delays
  - Prioritized contact notifications
  - Location sharing during escalation
  - Custom escalation messages
- **📝 Check-in History:** Complete log of check-ins and responses

### 📝 Message Templates
- **📋 Template Management:**
  - Contact-specific templates
  - Category-based organization
  - Variable placeholders
  - Usage tracking
- **🏷️ Template Tagging:** Organize templates by purpose or scenario
- **📊 Template Analytics:** Track usage patterns and effectiveness
- **🔄 Dynamic Variables:** Support for location, medical conditions, and custom variables

### 🎵 Alert System
- **🔊 Customizable Alerts:**
  - Multiple alert tones
  - Vibration patterns
  - Volume control
  - Sound preview
- **📱 Multi-Channel Dispatch:**
  - SMS (multiple providers)
  - Voice calls
  - Email
  - WhatsApp
  - Telegram
- **💫 Smart Notifications:**
  - Desktop notifications
  - Sound alerts
  - Visual indicators
  - Haptic feedback

### 💾 Data & Settings
- **🔒 Persistent Storage:**
  - Contacts and groups
  - Templates and preferences
  - Check-in schedules
  - Usage history
- **⚙️ Advanced Settings:**
  - AI provider configuration
  - SMS provider settings
  - Voice command preferences
  - Location update frequency
- **📱 PWA Features:**
  - Offline support
  - Home screen installation
  - Push notifications
  - Background sync

## 🛠️ Tech Stack

- **Frontend Framework:**
  - React with TypeScript
  - Vite for build tooling
  - Service Workers (PWA) for offline support
- **Styling & UI:**
  - Tailwind CSS for styling
  - Custom components for alerts, inputs, and settings
- **AI Integration:**
  - Google Gemini (`gemini-2.5-flash`) - Fastest response time
  - OpenAI (`gpt-3.5-turbo`) - Most reliable
  - Anthropic Claude (`claude-3-opus`) - Most advanced
  - Modular provider system for easy extensibility
- **Web APIs:**
  - Web Speech API for voice input
  - Geolocation API for location tracking
  - Web Audio API for alerts
  - Vibration API for haptic feedback

## 🚀 Fast Deployment & Running the App

You can deploy this application in minutes using a service like **Vercel** or **Netlify**.

### Step 1: Get API Keys

The app supports multiple AI providers. You can use any one or all of them:

1. **Google Gemini (Fastest)**
   - Go to the [Google AI Studio](https://aistudio.google.com/)
   - Click on **"Get API key"** and create a new key
   - Save it as `GEMINI_API_KEY`

2. **OpenAI (Most Reliable)**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Save it as `OPENAI_API_KEY`

3. **Anthropic (Most Advanced)**
   - Go to [Anthropic](https://www.anthropic.com/api)
   - Sign up and get an API key
   - Save it as `ANTHROPIC_API_KEY`

**Important:** Keep these keys safe and do not expose them publicly in your client-side code. These will be used as environment variables.

### Step 2: Deploy the Application

You have two options for deployment:

#### Option 1: GitHub Pages (Recommended)

1. **Fork this Repository:** Click the "Fork" button at the top right of this page.
2. **Configure Secrets:**
   - Go to your forked repository's Settings > Secrets and variables > Actions
   - Add your API keys as secrets:
     - `GEMINI_API_KEY` (from Google AI Studio)
     - `OPENAI_API_KEY` (from OpenAI Platform)
     - `ANTHROPIC_API_KEY` (from Anthropic)
   - At minimum, provide one of these keys
3. **Enable GitHub Pages:**
   - Go to Settings > Pages
   - Set the source to "GitHub Actions"
4. **Deploy:**
   - The app will automatically deploy when you push to main
   - You can also manually deploy from the Actions tab
   - Visit the "Environment" section to find your deployment URL

#### Option 2: Vercel Deployment

1. **Fork this Repository:** Click the "Fork" button at the top right of this page.
2. **Sign up on Vercel:** Go to [vercel.com](https://vercel.com/).
3. **Create a New Project:** From your Vercel dashboard, click "Add New... > Project".
4. **Import Repository:** Select your forked repository.
5. **Configure Environment:**
   - Add your API keys in the Environment Variables section
   - Use the same names as in the `.env.example` file
6. **Deploy:** Click "Deploy" to build and publish your app.

## 📲 Installation Guide

Because this is a Progressive Web App (PWA), you can install it on almost any device for a native-app experience.

### Android (Chrome)

1. Open the deployed app URL in Chrome
2. Tap the three-dot menu icon in the top right
3. Select **"Install app"** or **"Add to Home screen"**
4. The Friend SOS icon will appear on your home screen

### iOS (Safari)

1. Open the deployed app URL in Safari
2. Tap the "Share" icon (square with an up arrow)
3. Scroll down and select **"Add to Home Screen"**
4. Confirm the name and tap "Add"

### Desktop (Chrome, Edge)

1. Open the deployed app URL in your browser
2. Look for the "Install" icon in the address bar
3. Click it to install as a desktop application

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some amazing feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

## 📲 Installation Guide

Because this is a Progressive Web App (PWA), you can install it on almost any device for a native-app experience.

### Android (Chrome)

1. Open the deployed app URL in Chrome
2. Tap the three-dot menu icon in the top right
3. Select **"Install app"** or **"Add to Home screen"**
4. The Friend SOS icon will appear on your home screen

### iOS (Safari)

1. Open the deployed app URL in Safari
2. Tap the "Share" icon (square with an up arrow)
3. Scroll down and select **"Add to Home Screen"**
4. Confirm the name and tap "Add"

### Desktop (Chrome, Edge)

1. Open the deployed app URL in your browser
2. Look for the "Install" icon in the address bar
3. Click it to install as a desktop application

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or improvements, please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some amazing feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.


# Friend SOS - Personal Emergency Alert PWA

![GitHub repo size](https://img.shields.io/github/repo-size/your-username/friend-sos?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/friend-sos?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Friend SOS** is a modern, installable Progressive Web App (PWA) designed to provide a fast and simple way to send a detailed emergency alert to a predefined list of contacts. It leverages the Google Gemini API to intelligently craft a clear, concise SOS message, and uses your device's native capabilities to dispatch it instantly.

---

### [🚀 Live Demo (Link to your deployed app)](#)

---

## ✨ Key Features

- **🤖 Multi-Provider AI Alert Generation:** Flexibly choose between Gemini, OpenAI, and Anthropic to transform your message into a well-formatted, urgent alert.
- **📲 One-Click Dispatch Center:** After generating an alert, instantly open your device's native apps (Phone, SMS, WhatsApp, Email, Telegram) with the message and contact pre-filled.
- **🎤 Voice-to-Text:** Use your microphone to speak your emergency message directly into the app.
- **📍 Geolocation Sharing:** Automatically detects and appends your GPS coordinates (with a Google Maps link) to the alert. This feature is fully controllable with a privacy toggle.
- **✅ Real-time Contact Validation:** Get immediate visual feedback on whether entered contacts are valid emails or phone numbers.
- **🎵 Customizable Alert Sounds:** Choose from multiple alert tones or vibration, control the volume, and preview the sound before sending.
- **💾 Persistent State:** All your settings—contacts, default name, sound preferences, volume, and message templates—are saved in your browser's local storage.
- **📝 Message Templates:** Create and save pre-written messages for common scenarios to send alerts even faster.
- **⚙️ Advanced AI Controls:** Configure multiple AI providers, fine-tune the AI's creativity with a `Temperature` slider, and customize system instructions for each provider.
- **📱 Installable PWA:** Add Friend SOS to your phone's home screen for an app-like experience with offline support.
- **🎨 Modern & Responsive UI:** A clean, intuitive interface built with Tailwind CSS that works seamlessly on any device.

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

## 📲 How to Use on Different Platforms

Because this is a Progressive Web App, you can install it on almost any device for a native-app feel.

#### 🤖 Android (Chrome)
1.  Open the deployed app URL in Chrome.
2.  Tap the three-dot menu icon in the top right.
3.  Select **"Install app"** or **"Add to Home screen"**.
4.  The Friend SOS icon will appear on your home screen.

#### 🍎 iOS (Safari)
1.  Open the deployed app URL in Safari.
2.  Tap the "Share" icon (a square with an arrow pointing up).
3.  Scroll down and select **"Add to Home Screen"**.
4.  Confirm the name and tap "Add".

#### 💻 Desktop (Chrome, Edge)
1.  Open the deployed app URL in a supported browser.
2.  Look for an "Install" icon on the right side of the address bar.
3.  Click it and confirm the installation. The app will be added to your desktop or applications folder.

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

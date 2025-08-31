
# Friend SOS - Personal Emergency Alert PWA

![GitHub repo size](https://img.shields.io/github/repo-size/your-username/friend-sos?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/your-username/friend-sos?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**Friend SOS** is a modern, installable Progressive Web App (PWA) designed to provide a fast and simple way to send a detailed emergency alert to a predefined list of contacts. It leverages the Google Gemini API to intelligently craft a clear, concise SOS message, and uses your device's native capabilities to dispatch it instantly.

---

### [🚀 Live Demo (Link to your deployed app)](#)

---

## ✨ Key Features

- **🤖 AI-Powered Alert Generation:** Uses the Google Gemini API to transform your name, message, and location into a well-formatted, urgent alert.
- **📲 One-Click Dispatch Center:** After generating an alert, instantly open your device's native apps (Phone, SMS, WhatsApp, Email, Telegram) with the message and contact pre-filled.
- **🎤 Voice-to-Text:** Use your microphone to speak your emergency message directly into the app.
- **📍 Geolocation Sharing:** Automatically detects and appends your GPS coordinates (with a Google Maps link) to the alert. This feature is fully controllable with a privacy toggle.
- **✅ Real-time Contact Validation:** Get immediate visual feedback on whether entered contacts are valid emails or phone numbers.
- **🎵 Customizable Alert Sounds:** Choose from multiple alert tones or vibration, control the volume, and preview the sound before sending.
- **💾 Persistent State:** All your settings—contacts, default name, sound preferences, volume, and message templates—are saved in your browser's local storage.
- **📝 Message Templates:** Create and save pre-written messages for common scenarios to send alerts even faster.
- **⚙️ Advanced AI Controls:** Fine-tune the AI's creativity with a `Temperature` slider and provide `Custom System Instructions` for advanced use cases.
- **📱 Installable PWA:** Add Friend SOS to your phone's home screen for an app-like experience with offline support.
- **🎨 Modern & Responsive UI:** A clean, intuitive interface built with Tailwind CSS that works seamlessly on any device.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Core AI:** Google Gemini API (`gemini-2.5-flash`)
- **Web APIs:** Web Speech API, Geolocation API, Web Audio API, Vibration API
- **Offline Support:** Service Workers (PWA)

## 🚀 Fast Deployment & Running the App

You can deploy this application in minutes using a service like **Vercel** or **Netlify**.

### Step 1: Get a Google Gemini API Key

1.  Go to the [Google AI Studio](https://aistudio.google.com/).
2.  Click on **"Get API key"** and create a new key.
3.  **Important:** Keep this key safe and do not expose it publicly in your client-side code if you can avoid it. For this project, we will use it as an environment variable.

### Step 2: Deploy with Vercel

1.  **Fork this Repository:** Click the "Fork" button at the top right of this page.
2.  **Sign up on Vercel:** Go to [vercel.com](https://vercel.com/) and create an account (you can use your GitHub account).
3.  **Create a New Project:** From your Vercel dashboard, click "Add New... > Project".
4.  **Import Your Forked Repository:** Select the repository you just forked. Vercel will automatically detect that it's a React project.
5.  **Configure Environment Variables:**
    - Before deploying, go to the **"Environment Variables"** section.
    - Add a new variable with the name `API_KEY`.
    - Paste your Google Gemini API key into the value field.
6.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application. You'll get a public URL for your live app!

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

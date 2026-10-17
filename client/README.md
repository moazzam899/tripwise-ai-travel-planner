# TripWise — AI Travel Planner

TripWise is an AI-powered travel planning web application that helps users explore destinations, discover places to visit, get hotel recommendations, and generate personalized day-wise itineraries.

## ✨ Features

- 🤖 **AI-Powered Itineraries** — Generate personalized travel plans using AI.
- 📍 **Explore Places** — Discover attractions and activities at your destination.
- 🏨 **Hotel Recommendations** — Get AI-generated hotel suggestions.
- 🗓️ **Day-Wise Planning** — View your travel itinerary organized by day.
- 💾 **Save Trips** — Save, view, and delete trips using browser local storage.
- 🌗 **Light & Dark Mode** — Switch between themes.
- 📱 **Responsive Design** — Designed for desktop and mobile screens.
- 🎨 **Travel-Inspired UI** — A warm Sunset Escape color palette.

## 🛠️ Tech Stack

- React
- Vite
- Tailwind CSS
- JavaScript
- React Markdown
- Fetch API
- Browser Local Storage

## 📂 Project Structure

```text
client/
├── public/
│   └── images/
├── src/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- TripWise backend running locally

### Installation

1. Open a terminal inside the `client` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL displayed in your terminal, usually `http://localhost:5173`.

## 🔗 Backend

The frontend communicates with the TripWise Express backend for AI-powered travel planning, place discovery, and hotel recommendations.

Make sure the backend is configured with the required Groq API key and is running before using these features.

## 🔐 Environment Variables

Do not put API keys in frontend code or commit secret environment files to GitHub. Configure the Groq API key on the backend only.

## 🚀 Future Improvements

- Deploy the frontend and backend.
- Add maps and route visualization.
- Integrate live hotel and transport data.
- Add user accounts and cloud-based trip storage.

## 👨‍💻 Developer

**Moazzam Abbasi**

GitHub: [@moazzam899](https://github.com/moazzam899)
Email: moazzamabbasi2002@gmail.com

---

Built with React, Vite, and AI.

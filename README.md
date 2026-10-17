
# TripWise — AI Travel Planner

TripWise is an AI-powered travel planning web application that helps users explore destinations, discover places to visit, and get personalized hotel recommendations based on their travel preferences.


## 🌐 Live Demo

**Try TripWise here:** [Open TripWise](https://myaitripwise.vercel.app/)

## 📂 GitHub Repository

[View Source Code](https://github.com/moazzam899/tripwise-ai-travel-planner)



## Features

- AI-generated day-wise travel itineraries
- Explore popular places, activities, and local food
- AI-powered hotel and accommodation recommendations
- Save, view, and delete saved trips
- Light and dark mode
- Responsive design for desktop and mobile
- Loading indicators and error handling with retry options
- Guest-friendly experience with browser local storage

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Markdown

**Backend**
- Node.js
- Express.js
- Groq API
- REST APIs

**Storage**
- Browser Local Storage

## Project Structure

    travel-planner-ai/
    ├── client/
    ├── server/
    ├── .gitignore
    └── README.md

## Getting Started

### Prerequisites

- Node.js and npm
- A Groq API key

### 1. Clone the repository

    git clone YOUR_GITHUB_REPOSITORY_URL
    cd travel-planner-ai

### 2. Set up the backend

    cd server
    npm install

Create a `.env` file inside the `server` directory:

    GROQ_API_KEY=your_actual_groq_api_key
    PORT=5000

Replace the placeholder with your own Groq API key.

Start the backend:

    npm run dev

### 3. Set up the frontend

Open a second terminal:

    cd client
    npm install
    npm run dev

Open the local URL shown by Vite in your browser.

## Security

- Never commit your `.env` file or API keys.
- Use `.env.example` as a configuration template.
- Keep API credentials on the backend.

## Future Improvements

- Live maps and verified travel links
- More detailed travel budget breakdowns
- Deployment with a production API URL
- Additional travel planning features

## Author

Moazzam Abbasi

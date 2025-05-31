const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from frontend's public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Serve audio files with proper MIME types
app.get('/audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../frontend/public', req.params.filename);
  
  console.log('Attempting to serve audio file from:', filePath);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Audio file not found:', filePath, 'Error:', err);
      return res.status(404).send('Audio file not found');
    }
    
    console.log('Serving audio file:', filePath);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.sendFile(filePath);
  });
});

// API Routes
app.get("/api/sounds", (req, res) => {
  const availableSounds = [
    {
      id: "rain",
      name: "Rain",
      category: "Weather",
      file: "/audio/rain.mp3",
      icon: "🌧️",
    },
    {
      id: "ocean",
      name: "Ocean Waves",
      category: "Water",
      file: "/audio/ocean.mp3",
      icon: "🌊",
    },
    {
      id: "wind",
      name: "Strong Wind",
      category: "Weather",
      file: "/audio/wind.mp3",
      icon: "💨",
    },
    {
      id: "forest",
      name: "Forest Ambience",
      category: "Nature",
      file: "/audio/forest.mp3",
      icon: "🌲",
    },
    {
      id: "birds",
      name: "Bird Songs",
      category: "Nature",
      file: "/audio/birds.mp3",
      icon: "🐦",
    },
    {
      id: "fire",
      name: "Crackling Fire",
      category: "Indoor",
      file: "/audio/fire.mp3",
      icon: "🔥",
    },
    {
      id: "thunder",
      name: "Thunder",
      category: "Weather",
      file: "/audio/thunder.mp3",
      icon: "⚡",
    },
    {
      id: "stream",
      name: "Babbling Brook",
      category: "Water",
      file: "/audio/stream.mp3",
      icon: "🏞️",
    },
  ];

  res.json(availableSounds);
});

// Serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Soundscape Creator API running on http://localhost:${PORT}`);
});

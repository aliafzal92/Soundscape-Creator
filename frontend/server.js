import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// Serve audio files
app.use('/audio', express.static(join(__dirname, 'public/audio')));

// API Routes
app.get('/api/sounds', (req, res) => {
  const availableSounds = [
    {
      id: 'rain',
      name: 'Rain',
      category: 'Weather',
      file: 'rain.mp3',
      icon: '🌧️',
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      category: 'Water',
      file: 'ocean.mp3',
      icon: '🌊',
    },
    {
      id: 'wind',
      name: 'Strong Wind',
      category: 'Weather',
      file: 'wind.mp3',
      icon: '💨',
    },
    {
      id: 'forest',
      name: 'Forest Ambience',
      category: 'Nature',
      file: 'forest.mp3',
      icon: '🌲',
    },
    {
      id: 'birds',
      name: 'Bird Songs',
      category: 'Nature',
      file: 'birds.mp3',
      icon: '🐦',
    },
    {
      id: 'fire',
      name: 'Crackling Fire',
      category: 'Nature',
      file: 'fire.mp3',
      icon: '🔥',
    },
    {
      id: 'thunder',
      name: 'Thunderstorm',
      category: 'Weather',
      file: 'thunder.mp3',
      icon: '⚡',
    },
    {
      id: 'stream',
      name: 'Stream',
      category: 'Water',
      file: 'stream.mp3',
      icon: '🌊',
    },
  ];

  res.json(availableSounds);
});

// Handle SPA (Single Page Application) routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

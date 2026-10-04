import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const IMAGES_DIR = path.join(__dirname, 'images');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db.json exists
let db = {
  // votes structure: { [categoryName]: { [deviceId]: imageId } }
  votes: {},
  // comments structure: { [imageId]: [ { id, author, text, timestamp } ] }
  comments: {}
};

if (fs.existsSync(DB_FILE)) {
  try {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(rawData);
    if (!db.votes) db.votes = {};
    if (!db.comments) db.comments = {};
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

// Serve static images directly from images directory
app.use('/images-static', express.static(IMAGES_DIR));

// Helper: check if file is an image
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg']);
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

// Helper: scan images directory and structure categories
function scanImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(IMAGES_DIR, { withFileTypes: true });
  const categoriesMap = new Map();

  // 1. Process subdirectories
  entries.forEach(entry => {
    if (entry.isDirectory()) {
      const categoryName = entry.name;
      const subDirPath = path.join(IMAGES_DIR, categoryName);
      const subFiles = fs.readdirSync(subDirPath);
      
      const imagesList = subFiles
        .filter(isImageFile)
        .map(file => {
          const relativePath = `${categoryName}/${file}`;
          return {
            id: relativePath,
            filename: file,
            category: categoryName,
            url: `/images-static/${encodeURIComponent(categoryName)}/${encodeURIComponent(file)}`
          };
        });

      if (imagesList.length > 0) {
        categoriesMap.set(categoryName, imagesList);
      }
    }
  });

  // 2. Process root images if any
  const rootImages = entries
    .filter(entry => entry.isFile() && isImageFile(entry.name))
    .map(entry => {
      return {
        id: `General/${entry.name}`,
        filename: entry.name,
        category: 'General',
        url: `/images-static/${encodeURIComponent(entry.name)}`
      };
    });

  if (rootImages.length > 0) {
    categoriesMap.set('General', rootImages);
  }

  return categoriesMap;
}

// API: Get gallery categories and images with vote counts & comments
app.get('/api/gallery', (req, res) => {
  const deviceId = req.query.deviceId || '';
  const categoriesMap = scanImages();
  const result = [];

  for (const [categoryName, images] of categoriesMap.entries()) {
    const categoryVotes = db.votes[categoryName] || {};
    const userVotedImageId = categoryVotes[deviceId] || null;

    // Calculate vote counts for each image in this category
    const voteCounts = {};
    Object.values(categoryVotes).forEach(votedId => {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });

    const enrichedImages = images.map(img => {
      const commentsList = db.comments[img.id] || [];
      return {
        ...img,
        voteCount: voteCounts[img.id] || 0,
        hasVoted: userVotedImageId === img.id,
        commentCount: commentsList.length
      };
    });

    result.push({
      name: categoryName,
      userVotedImageId,
      images: enrichedImages
    });
  }

  res.json({ categories: result });
});

// API: Toggle or change vote for an image
app.post('/api/vote', (req, res) => {
  const { imageId, category, deviceId } = req.body;

  if (!imageId || !category || !deviceId) {
    return res.status(400).json({ error: 'imageId, category, and deviceId are required' });
  }

  if (!db.votes[category]) {
    db.votes[category] = {};
  }

  const currentVote = db.votes[category][deviceId];

  if (currentVote === imageId) {
    // Unvote if clicking the same image again
    delete db.votes[category][deviceId];
  } else {
    // Set/Change vote for this category
    db.votes[category][deviceId] = imageId;
  }

  saveDb();

  res.json({
    success: true,
    userVotedImageId: db.votes[category][deviceId] || null
  });
});

// API: Get comments for a specific image
app.get('/api/comments', (req, res) => {
  const imageId = req.query.imageId;
  if (!imageId) {
    return res.status(400).json({ error: 'imageId is required' });
  }
  const comments = db.comments[imageId] || [];
  res.json({ comments });
});

// API: Add a comment to an image
app.post('/api/comment', (req, res) => {
  const { imageId, author, text } = req.body;

  if (!imageId || !text || !text.trim()) {
    return res.status(400).json({ error: 'imageId and non-empty text are required' });
  }

  if (!db.comments[imageId]) {
    db.comments[imageId] = [];
  }

  const newComment = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    author: (author && author.trim()) ? author.trim() : 'Amigo Anónimo',
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  db.comments[imageId].push(newComment);
  saveDb();

  res.json({ success: true, comment: newComment, comments: db.comments[imageId] });
});

// API: Get ranking / leaderboard results
app.get('/api/ranking', (req, res) => {
  const categoriesMap = scanImages();
  const leaderboard = [];

  for (const [categoryName, images] of categoriesMap.entries()) {
    const categoryVotes = db.votes[categoryName] || {};
    const voteCounts = {};

    Object.values(categoryVotes).forEach(votedId => {
      voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });

    const rankedImages = images
      .map(img => ({
        ...img,
        voteCount: voteCounts[img.id] || 0,
        commentCount: (db.comments[img.id] || []).length
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    leaderboard.push({
      category: categoryName,
      totalVotes: Object.keys(categoryVotes).length,
      topImages: rankedImages
    });
  }

  res.json({ leaderboard });
});

// Serve frontend build in production
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/images-static')) {
      res.sendFile(path.join(distDir, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

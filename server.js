const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { ADMIN_SECRET_KEY } = require('./ADMIN_SECRET_KEY');
require('dotenv').config(); // Load environment variables from a .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use environment variable for MongoDB; fall back to local DB for development
const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://carlosoyarce3_db_user:fLv5kCB5K3phvrqE@fnl.epfanbh.mongodb.net/?appName=FNL';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Database connection error:', err));

// Define the news schema
const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const News = mongoose.model('News', newsSchema);

// Public endpoint: fetch all news
app.get('/api/news', async (req, res) => {
  try {
    const articles = await News.find().sort({ _id: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve news updates.' });
  }
});

// Admin endpoint: create a new article (requires x-admin-secret header)
app.post('/api/news/admin', async (req, res) => {
  const clientSecret = req.headers['x-admin-secret'];

  if (!clientSecret || clientSecret !== ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const { title, category, content } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const newArticle = new News({ title, category, content });
    await newArticle.save();
    res.status(201).json({ message: 'Article saved to database!', data: newArticle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save article to database.' });
  }
});

app.get('/', (req, res) => {
    res.send("Welcome to the Pro Wrestling News API! Use /api/news to view articles.");
});

app.listen(PORT, () => {
  console.log(`Wrestling API running on port ${PORT}`);
});

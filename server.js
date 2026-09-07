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
const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => console.error('Database connection error:', err));

// Define the news schema
const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: String, required: true }, // Changed to string so you can type "22 de Agosto"
    link: { type: String, required: true },
    cover: { type: String, required: true }, // Holds your S3 image link
    sub: { type: String, required: true },
    author: { type: String, required: true }
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
// 4. ADMIN ENDPOINT: Save a new article to the database
app.post('/api/news/admin', async (req, res) => {
    const clientSecret = req.headers['x-admin-secret'];
    
    if (!clientSecret || clientSecret !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized." });
    }

    // Extract ALL your new custom fields from Postman's body
    const { title, category, content, date, link, cover, sub, author } = req.body;

    // Check that the vital ones aren't empty
    if (!title || !category || !content) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Create the document matching the new schema
        const newArticle = new News({ 
            title, 
            category, 
            content, 
            date, 
            link, 
            cover, 
            sub, 
            author 
        });
        
        await newArticle.save();
        res.status(201).json({ message: "Details saved perfectly!", data: newArticle });
    } catch (error) {
        console.error(error); // This prints the exact crash reason to your Render logs if it hits an issue
        res.status(500).json({ error: "Failed to save article to database." });
    }
});

// 5. ADMIN ENDPOINT: Edit/Update an existing article by ID
app.put('/api/news/admin/:id', async (req, res) => {
    const clientSecret = req.headers['x-admin-secret'];
    
    // 1. Check for security key
    if (!clientSecret || clientSecret !== ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized." });
    }

    const articleId = req.params.id; // Pulls the MongoDB ID from the URL path
    const { title, category, content, date, link, cover, sub, author } = req.body;

    try {
        // 2. Find the article in MongoDB and update its fields
        const updatedArticle = await News.findByIdAndUpdate(
            articleId,
            { title, category, content, date, link, cover, sub, author },
            { new: true, runValidators: true } // 'new: true' returns the updated document back to us
        );

        // If the ID doesn't exist in the database
        if (!updatedArticle) {
            return res.status(404).json({ error: "Article not found." });
        }

        res.json({ message: "Article updated successfully!", data: updatedArticle });
    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ error: "Failed to update article in database." });
    }
});



app.get('/', (req, res) => {
    res.send("Welcome to the Pro Wrestling News API! Use /api/news to view articles.");
});

app.listen(PORT, () => {
  console.log(`Wrestling API running on port ${PORT}`);
});

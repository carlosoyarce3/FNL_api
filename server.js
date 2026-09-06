const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000; 

// Middleware configuration
app.use(cors());
app.use(express.json()); // Crucial: Allows the API to parse incoming JSON data 

// A secret key to protect your admin endpoint. Change "Kayfabe123" to your own password.
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET || "Kayfabe123"; 

// Your data array
let wrestlingNews = [
{
id: 1,
title: "Championship Match Announced for Summer Bash!",
date: "2026-09-05",
category: "Match Announcement",
content: "The Heavyweight Champion will defend the title against the ultimate underdog in a Steel Cage match."
}
]; 

// 1. PUBLIC ENDPOINT: Fetch all news updates
app.get('/api/news', (req, res) => {
res.json(wrestlingNews);
}); 

// 2. ADMIN ENDPOINT: Add a new article
app.post('/api/news/admin', (req, res) => {
// Check for security key in the request headers
const clientSecret = req.headers['x-admin-secret']; 

if (!clientSecret || clientSecret !== ADMIN_SECRET_KEY) {
return res.status(403).json({ error: "Unauthorized. Invalid secret key." });
}

// Extract the news data sent by the admin
const { title, category, content } = req.body;

// Basic validation to ensure fields aren't empty
if (!title || !category || !content) {
return res.status(400).json({ error: "Missing required fields: title, category, or content." });
}

// Build the new article object
const newArticle = {
id: wrestlingNews.length + 1,
title: title,
date: new Date().toISOString().split('T')[0], // Automatically generates today's date (YYYY-MM-DD)
category: category,
content: content
};

// Add it to our array
wrestlingNews.unshift(newArticle); // unshift adds it to the top so newest shows first

// Return the newly created article as confirmation
res.status(201).json({ message: "News article posted successfully!", data: newArticle });

}); 

app.listen(PORT, () => {
console.log(`Wrestling API is running on port ${PORT}`);
});
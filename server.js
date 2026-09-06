const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000; 

// Enable CORS so your website can read this data
app.use(cors());
app.use(express.json()); 

// Temporary data storage (In a production app, you would later connect this to a database like MongoDB)
const wrestlingNews = [
{
id: 1,
title: "Championship Match Announced for Summer Bash!",
date: "2026-09-05",
category: "Match Announcement",
content: "The Heavyweight Champion will defend the title against the ultimate underdog in a Steel Cage match."
},
{
id: 2,
title: "New Signing Shakes Up the Roster",
date: "2026-09-03",
category: "Roster Update",
content: "A former international star made a surprise debut at last night's TV tapings, attacking the champion."
}
]; 

// Endpoint to fetch all news updates
app.get('/api/news', (req, res) => {
res.json(wrestlingNews);
}); 

// Start the server
app.listen(PORT, () => {
console.log(`Wrestling API is running on port ${PORT}`);
});
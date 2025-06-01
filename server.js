const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://all-in-one-downloader.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.post('/api/download', (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  exec(`yt-dlp -j ${videoUrl}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`yt-dlp error: ${stderr}`);
      return res.status(500).json({ error: 'Failed to fetch video info' });
    }

    try {
      const videoData = JSON.parse(stdout);
      res.json({
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        formats: videoData.formats.map(f => ({
          url: f.url,
          format: f.format,
          resolution: f.height || 'audio',
          ext: f.ext
        }))
      });
    } catch (parseError) {
      console.error('Failed to parse yt-dlp output:', parseError);
      res.status(500).json({ error: 'Failed to parse video info' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
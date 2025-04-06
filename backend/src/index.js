import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import alaiService from './services/alai.service.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-presentation', async (req, res) => {
  try {
    const { url, prompt, presentationTitle } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Step 1: Scrape the website
    const scrapedData = await firecrawlService.scrapeWebsite(url, prompt);

    // Step 2: Create the presentation
    const presentationData = await alaiService.createPresentation(presentationTitle);

    res.json({
      success: true,
      scrapedData,
      presentation: {
        id: alaiService.getPresentationId(),
        slideId: alaiService.getSlideId(),
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
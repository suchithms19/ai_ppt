import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import FirecrawlApp from '@mendable/firecrawl-js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY
});

// Default prompt for website scraping
const DEFAULT_PROMPT = "Extract key information about the company/product including main features, benefits, pricing, and any other relevant details that would be useful for creating a presentation.";

// Scraping endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, prompt = DEFAULT_PROMPT } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scrapeResult = await firecrawl.extract([url], {
      prompt: prompt,
      enableWebSearch: true
    });

    if (!scrapeResult.success) {
      return res.status(500).json({ error: `Failed to scrape: ${scrapeResult.error}` });
    }

    res.json({ success: true, data: scrapeResult.data });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import firecrawlService from './services/firecrawl.service.js';
import alaiService from './services/alai.service.js';
import alaiWebSocketService from './services/alai-websocket.service.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-presentation', async (req, res) => {
  try {
    const { url, prompt, presentationTitle } = req.body;

    if (!url) {
      console.error('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Step 1: Scrape the website
    console.log('\nStep 1: Starting website scraping...');
    const scrapedData = await firecrawlService.scrapeWebsite(url, prompt);
    console.log('Website scraping completed');

    // Step 2: Create the presentation
    console.log('\nStep 2: Creating presentation...');
    await alaiService.createPresentation(presentationTitle);
    console.log('Presentation created');

    // Step 3: Generate slide variants using WebSocket
    console.log('\nStep 3: Generating slides...');
    await alaiWebSocketService.createSlideVariants(
      alaiService.getPresentationId(),
      alaiService.getSlideId(),
      scrapedData
    );
    console.log('Slide variants generated');

    const finalUrl = `https://app.getalai.com/presentation/${alaiService.getPresentationId()}`;
    console.log(`\nSuccess! Final presentation URL: ${finalUrl}`);
    
    res.json({ finalUrl });
  } catch (error) {
    console.error('\nError in presentation creation process:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
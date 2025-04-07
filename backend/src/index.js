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
    const { url, prompt, presentationTitle, numberOfSlides = 3 } = req.body;

    if (!url) {
      console.error('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Step 1: Scrape the website
    console.log('\nStep 1: Starting website scraping...');
    const scrapedData = await firecrawlService.scrapeWebsite(url, prompt);
    console.log('Website scraping completed');

    // Step 2: Create presentation with first slide
    console.log('\nStep 2: Creating presentation...');
    await alaiService.createPresentation(presentationTitle);
    console.log('Presentation created with first slide');

    // Step 3: Generate variants for first slide
    console.log('\nStep 3: Generating variants for first slide...');
    await alaiWebSocketService.createSlideVariants(
      alaiService.getPresentationId(),
      alaiService.getLatestSlideId(),
      scrapedData
    );
    console.log('First slide variants generated');

    // Step 4: Create and generate variants for additional slides
    console.log(`\nStep 4: Creating ${numberOfSlides - 1} additional slides...`);
    for (let i = 0; i < numberOfSlides; i++) {
      // Skip the first slide (order 0) as it's already created
      if (i === 0) continue;

      console.log(`\nProcessing slide with order ${i} of ${numberOfSlides - 1}...`);
      
      // Create new slide
      await alaiService.createNewSlide(i);
      console.log(`Slide with order ${i} created`);

      // Generate variants for the new slide
      await alaiWebSocketService.createSlideVariants(
        alaiService.getPresentationId(),
        alaiService.getLatestSlideId(),
        scrapedData
      );
      console.log(`Variants for slide with order ${i} generated`);
    }

    const finalUrl = `https://app.getalai.com/presentation/${alaiService.getPresentationId()}`;
    console.log(`\nSuccess! Final presentation URL: ${finalUrl}`);
    
    res.json({
      finalUrl,
    });
  } catch (error) {
    console.error('\nError in presentation creation process:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
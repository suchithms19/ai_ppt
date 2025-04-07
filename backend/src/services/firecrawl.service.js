import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';

dotenv.config();

class FirecrawlService {
  constructor() {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not set in environment variables');
    }

    this.firecrawl = new FirecrawlApp({
      apiKey: apiKey
    });
    console.log('🔥 FirecrawlService initialized');
  }

  // Default prompt for website scraping
  DEFAULT_PROMPT = "Extract key information about the company/product including main features, benefits, pricing, and any other relevant details that would be useful for creating a presentation.";

  async scrapeWebsite(url, customPrompt) {
    try {
      console.log(`🌐 Scraping website: ${url}`);
      const scrapeResult = await this.firecrawl.extract([url], {
        prompt: customPrompt || this.DEFAULT_PROMPT,
        enableWebSearch: true
      });

      if (!scrapeResult.success) {
        throw new Error(`Failed to scrape: ${scrapeResult.error}`);
      }

      console.log('✅ Website scraped successfully');
      return scrapeResult.data;
    } catch (error) {
      console.error('❌ Firecrawl error:', error);
      throw error;
    }
  }
}

export default new FirecrawlService(); 
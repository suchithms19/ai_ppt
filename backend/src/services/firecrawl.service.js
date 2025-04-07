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

  // Default comprehensive prompt for general website scraping
  DEFAULT_PROMPT = `Extract comprehensive information about the website content in a structured format. Include:

1. Main Topic/Product/Service:
   - Core offering or main subject
   - Key value proposition
   - Target audience or use cases

2. Key Features and Benefits:
   - Main features with descriptions
   - Unique selling points
   - Technical specifications (if applicable)
   - Benefits and advantages

3. Business/Organization Info:
   - Company background (if available)
   - Mission or purpose
   - Industry relevance
   - Market positioning

4. Pricing and Plans (if applicable):
   - Price points
   - Subscription tiers
   - Special offers
   - Payment options

5. Social Proof:
   - Customer testimonials
   - Reviews or ratings
   - Case studies
   - Awards or recognition

6. Additional Important Information:
   - Latest updates or news
   - Industry trends
   - Competitive advantages
   - Integration capabilities
   - Support options

7. Visual Elements:
   - Describe any significant images
   - Infographics content
   - Charts or graphs information
   - Brand colors or design elements

Please extract this information in a clear, organized manner that would be suitable for creating an engaging presentation.`;

  // Specialized prompt for product/service websites
  PRODUCT_PROMPT = `Analyze this website as an expert business analyst and extract detailed information in these categories:

1. Product/Service Overview:
   - Product name and category
   - Core functionality and purpose
   - Primary target market
   - Unique value proposition

2. Technical Details:
   - Specifications and requirements
   - Technology stack or materials used
   - Compatibility and integrations
   - Performance metrics or benchmarks

3. Market Analysis:
   - Competitive advantages
   - Market positioning
   - Industry trends addressed
   - Target audience segments

4. Features and Benefits:
   - Core features with detailed descriptions
   - Advanced capabilities
   - User benefits
   - Problem-solution mapping

5. Implementation and Usage:
   - Setup process
   - Use cases
   - Best practices
   - Success stories

6. Business Value:
   - ROI indicators
   - Cost-benefit analysis
   - Efficiency improvements
   - Success metrics

7. Support and Resources:
   - Customer support options
   - Documentation
   - Training materials
   - Community features

8. Pricing and Packages:
   - Pricing models
   - Package comparisons
   - Custom solutions
   - Payment terms

Please extract this information in a clear, organized manner that would be suitable for creating an engaging presentation.`;

  async scrapeWebsite(url, customPrompt) {
    try {
      console.log(`🌐 Scraping website: ${url}`);
      
      // Determine if it's a product/service website based on URL patterns
      const isProductSite = /product|pricing|features|solutions|shop|store/i.test(url);
      const defaultPrompt = isProductSite ? this.PRODUCT_PROMPT : this.DEFAULT_PROMPT;

      const scrapeResult = await this.firecrawl.extract([url], {
        prompt: customPrompt || defaultPrompt,
        enableWebSearch: true
      });

      console.log(scrapeResult.data)

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
# Website to Presentation Generator

This service automatically generates professional presentations from any website URL. It scrapes the website content and creates a multi-slide presentation using AI.

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firecrawl API key
- Alai Bearer Token

## ⚙️ Installation

1. Clone the repository
2. Install dependencies:
```bash
cd alai-challenge/backend
npm install
```

3. Copy the environment example file and fill in your credentials:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API keys:
```env
FIRECRAWL_API_KEY=your_firecrawl_api_key
ALAI_BEARER_TOKEN=your_alai_bearer_token
PORT=3000
```

## 🚦 Usage

1. Start the server:
```bash
npm run dev
```

2. Make a POST request to create a presentation:
```bash
curl -X POST http://localhost:3000/api/create-presentation \
-H "Content-Type: application/json" \
-d '{
  "url": "https://example.com",
  "presentationTitle": "My Presentation",
  "numberOfSlides": 3
}'
```

### Request Parameters

- `url` (required): The website URL to generate presentation from
- `presentationTitle` (optional): Custom title for the presentation
- `numberOfSlides` (optional): Number of slides to generate (default: 3)
- `prompt` (optional): Custom prompt for data extraction

### Response

```json
{
  "finalUrl": "https://app.getalai.com/presentation/your-presentation-id"
}
```

## 🔄 Process Flow

1. Scrapes website content using Firecrawl
2. Creates a new presentation with initial slide
3. Generates variants for the first slide
4. Creates additional slides based on the requested number
5. Generates variants for each additional slide
6. Returns the final presentation URL

## 🛡️ Environment Variables

- `FIRECRAWL_API_KEY`: Your Firecrawl API key for web scraping
- `ALAI_BEARER_TOKEN`: Your Alai authentication token
- `PORT`: Server port (default: 3000)

## 📝 Notes

- The service strictly uses only information found in the source website
- Each slide focuses on different aspects of the content
- The presentation maintains factual accuracy to the source material
- No external or fabricated information is added

## ⚠️ Error Handling

- Validates required URL parameter
- Handles WebSocket connection timeouts
- Manages API errors from both Firecrawl and Alai
- Provides clear error messages in responses


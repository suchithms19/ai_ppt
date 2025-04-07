import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

class AlaiWebSocketService {
  constructor() {
    this.wsUrl = 'wss://alai-standalone-backend.getalai.com/ws/create-and-stream-slide-variants';
  }

  // Default prompt for first slide (Title/Overview)
  FIRST_SLIDE_PROMPT = `Using ONLY the provided website data, create an impactful title slide and overview. DO NOT add any information that isn't in the source data. Your task is to:
1. Present the main topic/product exactly as described in the data
2. Use only the value propositions mentioned in the source
3. Create a professional and engaging visual layout
4. Use only brand elements found in the provided data
5. Keep all information 100% accurate to the source material`;

  // Prompt for feature/benefit slides
  FEATURES_SLIDE_PROMPT = `Using STRICTLY the provided website data, create feature and benefit slides. DO NOT invent or add any features not mentioned in the source. Your task is to:
1. Present only the features and benefits explicitly mentioned in the data
2. Use bullet points to organize the provided information
3. Include only competitive advantages stated in the source
4. Use only metrics and specifications from the data
5. Maintain factual accuracy while being engaging`;

  // Prompt for technical/implementation slides
  TECHNICAL_SLIDE_PROMPT = `Using EXCLUSIVELY the provided website data, create technical slides. DO NOT add any technical details not present in the source. Your task is to:
1. Present only the technical information found in the data
2. Create diagrams based solely on provided specifications
3. Use only implementation details mentioned in the source
4. Include only integration features described in the data
5. Present metrics exactly as they appear in the source`;

  // Prompt for business value/ROI slides
  VALUE_SLIDE_PROMPT = `Using ONLY the provided website data, create value proposition slides. DO NOT fabricate any business values or metrics. Your task is to:
1. Present only ROI and benefits mentioned in the source
2. Use success metrics exactly as stated in the data
3. Include only testimonials and case studies from the source
4. Present market position based on provided information
5. Use only cost-related data found in the source material`;

  getPromptForSlideNumber(slideNumber, totalSlides) {
    // First slide is always overview
    if (slideNumber === 0) {
      return this.FIRST_SLIDE_PROMPT;
    }

    // For remaining slides, cycle through different types based on position
    const position = slideNumber / totalSlides;
    
    if (position <= 0.4) {
      return this.FEATURES_SLIDE_PROMPT;
    } else if (position <= 0.7) {
      return this.TECHNICAL_SLIDE_PROMPT;
    } else {
      return this.VALUE_SLIDE_PROMPT;
    }
  }

  async createSlideVariants(presentationId, slideId, scrapedData, slideNumber = 0, totalSlides = 1) {
    return new Promise((resolve, reject) => {
      console.log('🔌 Starting WebSocket connection for slide creation...');
      
      const ws = new WebSocket(this.wsUrl);
      const variants = [];
      let isConnectionClosed = false;

      ws.on('open', () => {
        console.log('✅ WebSocket connection established successfully');
        const slidePrompt = this.getPromptForSlideNumber(slideNumber, totalSlides);
        console.log(`📝 Using prompt for slide ${slideNumber + 1} of ${totalSlides}`);

        const message = {
          auth_token: process.env.ALAI_BEARER_TOKEN,
          presentation_id: presentationId,
          slide_id: slideId,
          slide_specific_context: typeof scrapedData === 'string' ? scrapedData : JSON.stringify(scrapedData),
          images_on_slide: [],
          additional_instructions: slidePrompt + "\n\nIMPORTANT: Use ONLY the information provided in the source data. DO NOT add any external information, made-up statistics, or assumptions. If certain information is not available in the source, focus on what IS available rather than making things up.",
          layout_type: "AI_GENERATED_LAYOUT",
          update_tone_verbosity_calibration_status: true
        };

        console.log('📤 Sending initial request for slides...');
        ws.send(JSON.stringify(message));
      });

      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          variants.push(response);

          if (variants.length === 5) {
            console.log('✨ Received all 5 variants, closing connection...');
            isConnectionClosed = true;
            ws.close();
            resolve(variants);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('⚠️ WebSocket error:', error);
        if (!isConnectionClosed) {
          reject(error);
        }
      });

      ws.on('close', () => {
        console.log(`🔒 Connection closed. Received ${variants.length} variants`);
        if (!isConnectionClosed && variants.length < 5) {
          reject(new Error(`WebSocket connection closed before receiving all variants. Only received ${variants.length} variants`));
        }
      });

      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN && !isConnectionClosed) {
          console.log('⏰ WebSocket timeout after 120 seconds');
          ws.close();
          reject(new Error('WebSocket timeout after 120 seconds'));
        }
      }, 120000);
    });
  }
}

export default new AlaiWebSocketService(); 
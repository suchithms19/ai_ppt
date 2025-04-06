import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

class AlaiWebSocketService {
  constructor() {
    this.wsUrl = 'wss://alai-standalone-backend.getalai.com/ws/create-and-stream-slide-variants';
  }

  async createSlideVariants(presentationId, slideId, scrapedData) {
    console.log('Starting WebSocket connection for slide creation...');
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      const variants = [];

      ws.on('open', () => {
        console.log('WebSocket connection established successfully');
        const message = {
          auth_token: process.env.ALAI_BEARER_TOKEN,
          presentation_id: presentationId,
          slide_id: slideId,
          slide_specific_context: typeof scrapedData === 'string' ? scrapedData : JSON.stringify(scrapedData),
          images_on_slide: [],
          additional_instructions: "As an expert researcher, create a professional and engaging presentation that effectively communicates the key information. Focus on clear organization, impactful visuals, and concise messaging that highlights the most important points.",
          layout_type: "AI_GENERATED_LAYOUT",
          update_tone_verbosity_calibration_status: true
        };

        console.log('Sending initial request for slides...');
        ws.send(JSON.stringify(message));
      });

      ws.on('message', (data) => {
        try {
          const response = JSON.parse(data.toString());
          variants.push(response);
          console.log(`Received variant ${variants.length} of 5`);

          // After receiving 5 variants, close the connection and resolve
          if (variants.length === 5) {
            console.log('All 5 variants received successfully. Closing connection.');
            ws.close();
            resolve(variants);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      ws.on('close', () => {
        if (variants.length < 5) {
          console.error(`Connection closed prematurely. Only received ${variants.length} variants`);
          reject(new Error('WebSocket connection closed before receiving all variants'));
        }
      });

      // Set a timeout of 30 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          console.error('Connection timed out after 30 seconds');
          ws.close();
          reject(new Error('WebSocket timeout after 30 seconds'));
        }
      }, 30000);
    });
  }
}

export default new AlaiWebSocketService(); 
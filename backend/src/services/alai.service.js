import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

class AlaiService {
  constructor() {
    this.presentationId = null;
    this.slideId = null;
    this.baseUrl = 'https://alai-standalone-backend.getalai.com';
    console.log('AlaiService initialized');
  }

  async createPresentation(title = "Untitled Presentation") {
    console.log(`Creating new presentation with title: "${title}"`);
    try {
      const presentationId = uuidv4();
      console.log(`Generated presentation ID: ${presentationId}`);
      
      console.log('Sending request to create presentation...');
      const response = await fetch(`${this.baseUrl}/create-new-presentation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ALAI_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presentation_id: presentationId,
          presentation_title: title,
          create_first_slide: true,
          theme_id: "a6bff6e5-3afc-4336-830b-fbc710081012",
          default_color_set_id: 0
        })
      });

      if (!response.ok) {
        console.error(`Failed to create presentation: ${response.statusText}`);
        throw new Error(`Failed to create presentation: ${response.statusText}`);
      }

      const data = await response.json();
      this.presentationId = data.id;
      this.slideId = data.slides[0].id;
      return data;
    } catch (error) {
      console.error('Error creating presentation:', error);
      throw error;
    }
  }

  getPresentationId() {
    return this.presentationId;
  }

  getSlideId() {
    return this.slideId;
  }
}

export default new AlaiService(); 
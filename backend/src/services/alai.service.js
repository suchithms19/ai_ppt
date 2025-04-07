import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

class AlaiService {
  constructor() {
    this.presentationId = null;
    this.slideIds = [];  // Store all slide IDs
    this.baseUrl = 'https://alai-standalone-backend.getalai.com';
    console.log('AlaiService initialized');
  }

  async createPresentation(title = "Alai Presentation") {
    console.log(`Creating new presentation with title: "${title}"`);
    try {
      const newPresentationId = uuidv4();
      console.log(`Creating new presentation`);
      
      const response = await fetch(`${this.baseUrl}/create-new-presentation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ALAI_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presentation_id: newPresentationId,
          presentation_title: title,
          create_first_slide: true,
          theme_id: "a6bff6e5-3afc-4336-830b-fbc710081012",
          default_color_set_id: 0
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create presentation: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store the presentation ID
      this.presentationId = newPresentationId;
      
      // Store the first slide ID from the response
      if (data.slides[0]) {
        this.slideIds = [data.slides[0].id];
      } else {
        throw new Error('No slide_id in presentation creation response');
      }

      return {
        presentationId: this.presentationId,
        slideId: data.slide_id
      };
    } catch (error) {
      console.error('Error creating presentation:', error);
      throw error;
    }
  }

  async createNewSlide(slideOrder) {
    try {
      const newSlideId = uuidv4();
      console.log(`Creating slide with order ${slideOrder}`);
      
      const response = await fetch(`${this.baseUrl}/create-new-slide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ALAI_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slide_id: newSlideId,
          presentation_id: this.presentationId,
          product_type: "PRESENTATION_CREATOR",
          slide_order: slideOrder,
          color_set_id: 0
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create new slide: ${response.statusText}`);
      }

      // Store the new slide ID
      this.slideIds.push(newSlideId);
      return newSlideId;
    } catch (error) {
      console.error('Error creating new slide:', error);
      throw error;
    }
  }

  getPresentationId() {
    return this.presentationId;
  }

  getAllSlideIds() {
    return this.slideIds;
  }

  getLatestSlideId() {
    return this.slideIds[this.slideIds.length - 1];
  }
}

export default new AlaiService(); 
const axios = require('axios');

class VideoGenerator {
  constructor() {
    this.apiKey = process.env.DID_API_KEY;
    this.baseUrl = 'https://api.d-id.com';
    
    // Debug log
    if (!this.apiKey) {
      console.error('⚠️  WARNING: DID_API_KEY not found in environment variables!');
    } else {
      console.log(`✅ D-ID API Key loaded: ${this.apiKey.substring(0, 20)}...`);
    }
  }

  /**
   * Generate a talking avatar video from job description
   * @param {String} jobDescription - The job description text
   * @param {String} jobTitle - The job title
   * @returns {Promise} - Video creation response
   */
  async generateJobVideo(jobDescription, jobTitle) {
    try {
      // Create a professional script from job description
      const script = this.createVideoScript(jobDescription, jobTitle);

      // D-ID API - Create Talk
      const response = await axios.post(
        `${this.baseUrl}/talks`,
        {
          script: {
            type: 'text',
            input: script
          },
          source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
        },
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          }
        }
      );

      return {
        success: true,
        videoId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Video generation error:', error.response?.data || error.message);
      throw new Error('Failed to generate video: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Check video generation status
   * @param {String} videoId - The D-ID video ID
   * @returns {Promise} - Video status and URL
   */
  async checkVideoStatus(videoId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/talks/${videoId}`,
        {
          headers: {
            'Authorization': this.apiKey
          }
        }
      );

      return {
        success: true,
        status: response.data.status,
        videoUrl: response.data.result_url,
        duration: response.data.duration
      };
    } catch (error) {
      console.error('Video status check error:', error.response?.data || error.message);
      throw new Error('Failed to check video status: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Create a concise and professional video script from job description
   * @param {String} description - Job description
   * @param {String} title - Job title
   * @returns {String} - Formatted script
   */
  createVideoScript(description, title) {
    // Limit to ~300 characters for a ~30 second video
    let script = `Hello! We are hiring for ${title}. `;
    
    // Extract key points from description (first 200 chars)
    const shortDesc = description.substring(0, 200).trim();
    script += shortDesc;
    
    // Add call to action
    script += ' Apply now to join our team!';

    // Ensure it's not too long (D-ID has limits)
    if (script.length > 500) {
      script = script.substring(0, 497) + '...';
    }

    return script;
  }

  /**
   * Delete a video
   * @param {String} videoId - The D-ID video ID
   * @returns {Promise}
   */
  async deleteVideo(videoId) {
    try {
      await axios.delete(
        `${this.baseUrl}/talks/${videoId}`,
        {
          headers: {
            'Authorization': this.apiKey
          }
        }
      );
      return { success: true };
    } catch (error) {
      console.error('Video deletion error:', error.response?.data || error.message);
      throw new Error('Failed to delete video: ' + (error.response?.data?.message || error.message));
    }
  }
}

module.exports = new VideoGenerator();

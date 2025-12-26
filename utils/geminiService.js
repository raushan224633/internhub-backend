const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    // Initialize the Gemini AI client
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try different model names - gemini-1.5-flash-latest is often available
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  }

  // Generate job suggestions based on job title
  async generateJobSuggestions(jobTitle) {
    try {
      const prompt = `
        Based on the job title "${jobTitle}", provide comprehensive suggestions for an internship/job posting. Return the response in the following JSON format:

        {
          "requiredSkills": ["skill1", "skill2", "skill3", ...],
          "preferredSkills": ["skill1", "skill2", ...],
          "responsibilities": ["responsibility1", "responsibility2", ...],
          "qualifications": ["qualification1", "qualification2", ...],
          "description": "A detailed job description...",
          "categories": ["category1", "category2"],
          "experienceLevel": "Entry Level/Mid Level/Senior Level",
          "salaryRange": {
            "min": "minimum salary in INR",
            "max": "maximum salary in INR",
            "note": "salary explanation"
          },
          "benefits": ["benefit1", "benefit2", ...],
          "workMode": ["Remote", "On-site", "Hybrid"],
          "duration": "Suggested internship duration",
          "learningOutcomes": ["outcome1", "outcome2", ..."]
        }

        Make sure the suggestions are:
        - Industry-specific and relevant to the job title
        - Appropriate for Indian job market
        - Include both technical and soft skills
        - Realistic salary ranges for internships/entry-level positions
        - Include modern tools and technologies
        - Focus on learning and growth opportunities
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('Error generating job suggestions:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  }

  // Enhance job description based on basic input
  async enhanceJobDescription(basicDescription, jobTitle, company) {
    try {
      const prompt = `
        Enhance and improve this job description for a "${jobTitle}" position at "${company}":

        Current Description: "${basicDescription}"

        Please provide an enhanced version that includes:
        - Professional and engaging language
        - Clear structure with proper formatting
        - Company culture insights (generic but professional)
        - Growth opportunities
        - What makes this role exciting
        - Call to action for candidates

        Return only the enhanced description text, not in JSON format.
        Make it professional, engaging, and suitable for attracting top talent.
        Keep it between 150-300 words.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Error enhancing job description:', error);
      throw new Error('Failed to enhance job description');
    }
  }

  // Generate skills suggestions based on job title and description
  async suggestSkills(jobTitle, jobDescription = '') {
    try {
      const prompt = `
        Based on the job title "${jobTitle}" and description "${jobDescription}", suggest relevant skills for an internship position.

        Return the response in this JSON format:
        {
          "technicalSkills": ["skill1", "skill2", ...],
          "softSkills": ["skill1", "skill2", ...],
          "tools": ["tool1", "tool2", ...],
          "frameworks": ["framework1", "framework2", ...],
          "languages": ["language1", "language2", ..."],
          "trending": ["trending skill1", "trending skill2", ...]
        }

        Focus on:
        - Current industry standards
        - Both beginner and intermediate level skills
        - Popular tools and technologies
        - Skills that are in demand in the Indian job market
        - Include emerging technologies where relevant
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('Error suggesting skills:', error);
      throw new Error('Failed to generate skill suggestions');
    }
  }

  // Generate requirements based on job details
  async generateRequirements(jobTitle, experienceLevel, skills = []) {
    try {
      const prompt = `
        Generate job requirements for a "${jobTitle}" position at "${experienceLevel}" level.
        ${skills.length > 0 ? `Preferred skills: ${skills.join(', ')}` : ''}

        Return the response in this JSON format:
        {
          "education": ["requirement1", "requirement2", ...],
          "experience": ["requirement1", "requirement2", ...],
          "technical": ["requirement1", "requirement2", ...],
          "personal": ["requirement1", "requirement2", ..."],
          "preferred": ["requirement1", "requirement2", ..."]
        }

        Make requirements:
        - Realistic for the experience level
        - Specific to the job role
        - Include both must-have and nice-to-have
        - Appropriate for Indian education system and job market
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('Error generating requirements:', error);
      throw new Error('Failed to generate requirements');
    }
  }

  // Analyze job posting for completeness and suggestions
  async analyzeJobPosting(jobData) {
    try {
      const prompt = `
        Analyze this job posting and provide suggestions for improvement:

        Job Data:
        ${JSON.stringify(jobData, null, 2)}

        Return analysis in this JSON format:
        {
          "completenessScore": 85,
          "strengths": ["strength1", "strength2", ...],
          "improvements": [
            {
              "category": "field name",
              "suggestion": "specific suggestion",
              "priority": "high/medium/low"
            }
          ],
          "missingFields": ["field1", "field2", ..."],
          "overallFeedback": "General feedback about the job posting",
          "marketCompetitiveness": {
            "score": 75,
            "factors": ["factor1", "factor2", ..."],
            "suggestions": ["suggestion1", "suggestion2", ...]
          }
        }

        Analyze:
        - Completeness of information
        - Appeal to candidates
        - Market competitiveness
        - Missing important details
        - Areas for improvement
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('Error analyzing job posting:', error);
      throw new Error('Failed to analyze job posting');
    }
  }

  // Generate interview questions for the job role
  async generateInterviewQuestions(jobTitle, skills = [], experienceLevel = '') {
    try {
      const prompt = `
        Generate interview questions for a "${jobTitle}" position.
        ${experienceLevel ? `Experience Level: ${experienceLevel}` : ''}
        ${skills.length > 0 ? `Required Skills: ${skills.join(', ')}` : ''}

        Return the response in this JSON format:
        {
          "technical": [
            {
              "question": "question text",
              "difficulty": "easy/medium/hard",
              "category": "category name"
            }
          ],
          "behavioral": [
            {
              "question": "question text",
              "purpose": "what this question evaluates"
            }
          ],
          "situational": [
            {
              "question": "question text",
              "expectedAnswer": "brief guidance on what to look for"
            }
          ]
        }

        Include:
        - Mix of easy, medium, and hard technical questions
        - Behavioral questions relevant to internships
        - Situational questions for problem-solving
        - Questions appropriate for the experience level
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }
}

module.exports = new GeminiService();
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

// Function to extract text from resume file
const extractTextFromResume = async (filePath, fileType) => {
  let text = '';
  
  try {
    if (fileType === 'application/pdf') {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Extract text from DOC/DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from resume:', error);
    throw new Error('Failed to parse resume file: ' + error.message);
  }
};

// Function to analyze resume for ATS compatibility
const analyzeResume = async (filePath, fileType) => {
  try {
    // Extract text from resume
    const text = await extractTextFromResume(filePath, fileType);
    
    // Convert to lowercase for easier analysis
    const lowerText = text.toLowerCase();
    
    // Initialize scores
    let keywordScore = 0;
    let formatScore = 0;
    let contentScore = 0;
    
    // Keywords analysis
    const essentialKeywords = [
      'experience', 'education', 'skills', 'contact', 'summary', 
      'objective', 'work', 'job', 'position', 'company', 'responsibilities'
    ];
    
    const foundKeywords = essentialKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );
    
    keywordScore = Math.min(100, (foundKeywords.length / essentialKeywords.length) * 100);
    
    // Format analysis (simple check for standard sections)
    const standardSections = [
      'work experience', 'education', 'skills', 'contact information', 
      'professional summary', 'objective'
    ];
    
    const foundSections = standardSections.filter(section => 
      lowerText.includes(section)
    );
    
    formatScore = Math.min(100, (foundSections.length / standardSections.length) * 100);
    
    // Content analysis (check for completeness)
    const hasContactInfo = lowerText.includes('email') || lowerText.includes('phone') || lowerText.includes('address');
    const hasWorkExperience = lowerText.includes('experience') || lowerText.includes('work');
    const hasEducation = lowerText.includes('education') || lowerText.includes('degree') || lowerText.includes('university');
    const hasSkills = lowerText.includes('skills') || lowerText.includes('abilities');
    
    const contentElements = [hasContactInfo, hasWorkExperience, hasEducation, hasSkills];
    const filledElements = contentElements.filter(element => element).length;
    
    contentScore = (filledElements / contentElements.length) * 100;
    
    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (keywordScore * 0.4) + 
      (formatScore * 0.3) + 
      (contentScore * 0.3)
    );
    
    // Generate suggestions based on analysis
    const suggestions = {
      keywords: [],
      format: [],
      content: []
    };
    
    // Keyword suggestions
    if (keywordScore < 80) {
      const missingKeywords = essentialKeywords.filter(keyword => 
        !lowerText.includes(keyword)
      );
      
      if (missingKeywords.length > 0) {
        suggestions.keywords.push(`Add missing sections: ${missingKeywords.slice(0, 3).join(', ')}`);
      }
      
      suggestions.keywords.push("Include more industry-specific keywords relevant to your field");
      suggestions.keywords.push("Add action verbs to describe your accomplishments");
    }
    
    // Format suggestions
    if (formatScore < 80) {
      const missingSections = standardSections.filter(section => 
        !lowerText.includes(section)
      );
      
      if (missingSections.length > 0) {
        suggestions.format.push(`Add standard sections: ${missingSections.slice(0, 3).join(', ')}`);
      }
      
      suggestions.format.push("Use clear section headings");
      suggestions.format.push("Maintain consistent formatting throughout");
    }
    
    // Content suggestions
    if (contentScore < 80) {
      if (!hasContactInfo) suggestions.content.push("Add complete contact information");
      if (!hasWorkExperience) suggestions.content.push("Include detailed work experience");
      if (!hasEducation) suggestions.content.push("Add education details");
      if (!hasSkills) suggestions.content.push("List relevant skills");
      
      suggestions.content.push("Quantify achievements with numbers and metrics");
      suggestions.content.push("Use bullet points for better readability");
    }
    
    // Good points based on what was found
    const goodPoints = {
      keywords: [],
      format: [],
      content: []
    };
    
    // Positive feedback
    if (keywordScore >= 70) {
      goodPoints.keywords.push("Resume includes essential keywords");
      goodPoints.keywords.push("Good use of standard terminology");
    }
    
    if (formatScore >= 70) {
      goodPoints.format.push("Uses standard section headings");
      goodPoints.format.push("Consistent formatting throughout");
    }
    
    if (contentScore >= 70) {
      if (hasContactInfo) goodPoints.content.push("Complete contact information included");
      if (hasWorkExperience) goodPoints.content.push("Work experience section present");
      if (hasEducation) goodPoints.content.push("Education details included");
      if (hasSkills) goodPoints.content.push("Skills section present");
    }
    
    // Ensure we have some positive feedback even if scores are low
    if (goodPoints.keywords.length === 0) {
      goodPoints.keywords.push("Basic structure is present");
    }
    
    if (goodPoints.format.length === 0) {
      goodPoints.format.push("Document is readable");
    }
    
    if (goodPoints.content.length === 0) {
      goodPoints.content.push("Contains resume content");
    }
    
    // General recommendations
    const recommendations = [
      "Save resume as PDF to preserve formatting",
      "Use standard fonts like Arial, Calibri, or Times New Roman",
      "Keep file size under 2MB for better compatibility",
      "Avoid graphics, charts, or complex layouts that ATS can't parse",
      "Include keywords from job descriptions you're targeting"
    ];
    
    // Return analysis result
    return {
      overallScore,
      sections: {
        keywords: {
          score: Math.round(keywordScore),
          suggestions: suggestions.keywords.slice(0, 5),
          goodPoints: goodPoints.keywords
        },
        format: {
          score: Math.round(formatScore),
          suggestions: suggestions.format.slice(0, 5),
          goodPoints: goodPoints.format
        },
        content: {
          score: Math.round(contentScore),
          suggestions: suggestions.content.slice(0, 5),
          goodPoints: goodPoints.content
        }
      },
      recommendations
    };
    
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume for ATS compatibility');
  }
};

// @desc    Check resume for ATS compatibility
// @route   POST /api/ats/check
// @access  Private (Intern)
const checkATSCompatibility = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file'
      });
    }

    // Get file path
    const filePath = req.file.path;
    
    // Analyze the resume
    const analysisResult = await analyzeResume(filePath, req.file.mimetype);
    
    // Clean up uploaded file
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      console.error('Error deleting uploaded file:', unlinkErr);
    }
    
    // Return analysis result
    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: analysisResult
    });
  } catch (error) {
    console.error('ATS Check Error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting uploaded file:', unlinkErr);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error analyzing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  checkATSCompatibility
};
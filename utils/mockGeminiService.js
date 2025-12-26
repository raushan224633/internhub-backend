// Mock AI service for development/demo purposes
// Replace with real Gemini service once API access is configured

class MockGeminiService {
  constructor() {
    console.log('🤖 Using Mock AI Service for development');
  }

  // Generate job suggestions based on job title
  async generateJobSuggestions(jobTitle) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const jobTitleLower = jobTitle.toLowerCase();
    let suggestions = {};

    if (jobTitleLower.includes('developer') || jobTitleLower.includes('engineer')) {
      suggestions = {
        requiredSkills: [
          "Programming Languages", "Problem Solving", "Data Structures", 
          "Algorithms", "Version Control (Git)", "Testing", "Debugging"
        ],
        preferredSkills: [
          "Cloud Computing", "DevOps", "Agile Methodology", "CI/CD",
          "Code Review", "Documentation", "Team Collaboration"
        ],
        responsibilities: [
          "Develop and maintain high-quality software applications",
          "Collaborate with cross-functional teams to define and implement features",
          "Write clean, maintainable, and efficient code",
          "Participate in code reviews and provide constructive feedback",
          "Troubleshoot and debug applications to optimize performance",
          "Stay updated with the latest industry trends and technologies",
          "Contribute to technical documentation and knowledge sharing"
        ],
        qualifications: [
          "Bachelor's degree in Computer Science or related field",
          "Strong programming fundamentals and logical thinking",
          "Experience with software development lifecycle",
          "Good understanding of database concepts",
          "Excellent problem-solving and analytical skills",
          "Strong communication and teamwork abilities",
          "Willingness to learn new technologies"
        ],
        description: `We are seeking a talented ${jobTitle} to join our dynamic development team. This role offers an excellent opportunity to work on challenging projects, learn from experienced developers, and contribute to innovative solutions. You'll be working in a collaborative environment where your ideas matter and your growth is supported.

As a ${jobTitle}, you'll have the chance to work with modern technologies, participate in the full software development lifecycle, and build applications that make a real impact. We value continuous learning, code quality, and team collaboration.

Join us in creating exceptional software solutions while advancing your career in a supportive and growth-oriented environment.`,
        categories: ["Technology", "Software Development", "Engineering"],
        experienceLevel: jobTitleLower.includes('senior') ? 'Senior Level' : 
                        jobTitleLower.includes('junior') ? 'Entry Level' : 'Mid Level',
        salaryRange: {
          min: jobTitleLower.includes('senior') ? "800000" : 
               jobTitleLower.includes('junior') ? "300000" : "500000",
          max: jobTitleLower.includes('senior') ? "1500000" : 
               jobTitleLower.includes('junior') ? "600000" : "900000",
          note: "Salary range based on experience and skills. Additional benefits included."
        },
        benefits: [
          "Health and medical insurance",
          "Learning and development budget",
          "Flexible working hours",
          "Work from home options",
          "Performance bonuses",
          "Career growth opportunities"
        ],
        workMode: ["Remote", "Hybrid", "On-site"],
        duration: jobTitleLower.includes('intern') ? "3-6 months" : "Full-time permanent",
        learningOutcomes: [
          "Master modern development practices",
          "Gain experience in agile development",
          "Improve problem-solving skills",
          "Learn to work in collaborative environments",
          "Understand software architecture principles"
        ]
      };

      // Add specific tech skills based on job title
      if (jobTitleLower.includes('react') || jobTitleLower.includes('frontend')) {
        suggestions.requiredSkills = [...suggestions.requiredSkills, "React", "JavaScript", "HTML", "CSS", "Redux"];
        suggestions.preferredSkills = [...suggestions.preferredSkills, "TypeScript", "Next.js", "Material-UI"];
      } else if (jobTitleLower.includes('node') || jobTitleLower.includes('backend')) {
        suggestions.requiredSkills = [...suggestions.requiredSkills, "Node.js", "Express.js", "MongoDB", "RESTful APIs"];
        suggestions.preferredSkills = [...suggestions.preferredSkills, "GraphQL", "Microservices", "Redis"];
      } else if (jobTitleLower.includes('full') || jobTitleLower.includes('fullstack')) {
        suggestions.requiredSkills = [...suggestions.requiredSkills, "React", "Node.js", "JavaScript", "MongoDB", "Express.js"];
        suggestions.preferredSkills = [...suggestions.preferredSkills, "TypeScript", "GraphQL", "Docker"];
      } else if (jobTitleLower.includes('python')) {
        suggestions.requiredSkills = [...suggestions.requiredSkills, "Python", "Django/Flask", "SQLAlchemy", "PostgreSQL"];
        suggestions.preferredSkills = [...suggestions.preferredSkills, "FastAPI", "Celery", "Docker", "AWS"];
      }

    } else if (jobTitleLower.includes('designer')) {
      suggestions = {
        requiredSkills: ["UI/UX Design", "Adobe Creative Suite", "Figma", "Sketch", "Design Thinking", "Wireframing"],
        preferredSkills: ["Prototyping", "User Research", "Design Systems", "Animation", "Brand Design"],
        responsibilities: [
          "Create visually appealing and user-friendly designs",
          "Develop wireframes, mockups, and prototypes",
          "Collaborate with developers to ensure design implementation",
          "Conduct user research and usability testing",
          "Maintain consistency across design systems"
        ],
        qualifications: [
          "Bachelor's degree in Design or related field",
          "Portfolio demonstrating design skills",
          "Understanding of design principles and trends",
          "Knowledge of design tools and software"
        ],
        description: `We're looking for a creative ${jobTitle} to join our design team and help create amazing user experiences.`,
        categories: ["Design", "Creative", "User Experience"],
        experienceLevel: jobTitleLower.includes('senior') ? 'Senior Level' : 'Mid Level',
        salaryRange: { min: "400000", max: "800000", note: "Based on portfolio and experience" },
        benefits: ["Creative environment", "Design tool licenses", "Learning opportunities"],
        workMode: ["Hybrid", "On-site"],
        duration: "Full-time",
        learningOutcomes: ["Advanced design skills", "User-centered design", "Design system creation"]
      };

    } else if (jobTitleLower.includes('marketing')) {
      suggestions = {
        requiredSkills: ["Digital Marketing", "Content Creation", "SEO", "Analytics", "Social Media Marketing"],
        preferredSkills: ["Google Ads", "Facebook Ads", "Email Marketing", "Marketing Automation", "CRM"],
        responsibilities: [
          "Develop and execute marketing campaigns",
          "Create engaging content for various channels",
          "Analyze marketing performance and metrics",
          "Manage social media presence",
          "Collaborate with sales team"
        ],
        qualifications: [
          "Bachelor's degree in Marketing or related field",
          "Understanding of digital marketing trends",
          "Experience with marketing tools and platforms",
          "Strong communication skills"
        ],
        description: `Join our marketing team as a ${jobTitle} and help us reach and engage our target audience.`,
        categories: ["Marketing", "Digital Marketing", "Communications"],
        experienceLevel: 'Mid Level',
        salaryRange: { min: "350000", max: "700000", note: "Plus performance incentives" },
        benefits: ["Marketing tool access", "Conference attendance", "Performance bonuses"],
        workMode: ["Remote", "Hybrid"],
        duration: "Full-time",
        learningOutcomes: ["Digital marketing mastery", "Analytics skills", "Campaign management"]
      };

    } else {
      // Generic suggestions for other roles
      suggestions = {
        requiredSkills: ["Communication", "Problem Solving", "Time Management", "Teamwork", "Adaptability"],
        preferredSkills: ["Leadership", "Project Management", "Industry Knowledge", "Technical Skills"],
        responsibilities: [
          "Execute assigned tasks and projects efficiently",
          "Collaborate with team members and stakeholders",
          "Contribute to team goals and objectives",
          "Maintain quality standards in work output",
          "Participate in team meetings and discussions"
        ],
        qualifications: [
          "Bachelor's degree in relevant field",
          "Strong work ethic and positive attitude",
          "Good communication and interpersonal skills",
          "Ability to work in fast-paced environment"
        ],
        description: `We are seeking a motivated ${jobTitle} to join our growing team and contribute to our success.`,
        categories: ["General", "Professional"],
        experienceLevel: 'Entry Level',
        salaryRange: { min: "300000", max: "600000", note: "Competitive salary package" },
        benefits: ["Training programs", "Career development", "Work-life balance"],
        workMode: ["On-site", "Hybrid"],
        duration: "Full-time",
        learningOutcomes: ["Professional development", "Industry knowledge", "Skill enhancement"]
      };
    }

    return suggestions;
  }

  // Enhance job description based on basic input
  async enhanceJobDescription(basicDescription, jobTitle, company) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return `🚀 **${jobTitle} at ${company}**

${basicDescription}

**Why Join Us?**
We're a forward-thinking company that values innovation, collaboration, and professional growth. As a ${jobTitle}, you'll be part of a dynamic team where your contributions make a real difference.

**What Makes This Role Special:**
• Work on cutting-edge projects with the latest technologies
• Collaborate with talented professionals from diverse backgrounds
• Enjoy flexible work arrangements and excellent benefits
• Access to continuous learning and development opportunities
• Clear career progression path with mentorship support

**Ready to Take Your Career to the Next Level?**
If you're passionate about excellence and ready to make an impact, we'd love to hear from you. Apply now and join our mission to create exceptional solutions that matter.

*We're committed to creating an inclusive environment where everyone can thrive.*`;
  }

  // Generate skills suggestions based on job title and description
  async suggestSkills(jobTitle, jobDescription = '') {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const jobTitleLower = jobTitle.toLowerCase();
    
    if (jobTitleLower.includes('developer') || jobTitleLower.includes('engineer')) {
      return {
        technicalSkills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git", "REST APIs"],
        softSkills: ["Problem Solving", "Communication", "Teamwork", "Time Management"],
        tools: ["VS Code", "Docker", "Postman", "GitHub", "Jenkins", "JIRA"],
        frameworks: ["React", "Angular", "Vue.js", "Express.js", "Django", "Spring Boot"],
        languages: ["JavaScript", "Python", "Java", "TypeScript", "Go", "C++"],
        trending: ["AI/ML", "Cloud Computing", "DevOps", "Microservices", "Kubernetes"]
      };
    } else if (jobTitleLower.includes('designer')) {
      return {
        technicalSkills: ["Adobe Photoshop", "Figma", "Sketch", "InDesign", "Illustrator"],
        softSkills: ["Creativity", "Attention to Detail", "User Empathy", "Communication"],
        tools: ["Adobe Creative Suite", "Figma", "InVision", "Principle", "Zeplin"],
        frameworks: ["Material Design", "Human Interface Guidelines", "Atomic Design"],
        languages: ["HTML", "CSS", "Basic JavaScript"],
        trending: ["Design Systems", "Voice UI", "AR/VR Design", "Motion Design"]
      };
    } else {
      return {
        technicalSkills: ["Microsoft Office", "Google Workspace", "Data Analysis", "Project Management"],
        softSkills: ["Communication", "Leadership", "Problem Solving", "Adaptability"],
        tools: ["Slack", "Trello", "Asana", "Zoom", "Excel", "PowerPoint"],
        frameworks: ["Agile", "Scrum", "Kanban", "Six Sigma"],
        languages: ["English", "Business Writing"],
        trending: ["Digital Transformation", "Remote Collaboration", "Data Analytics", "Automation"]
      };
    }
  }

  // Generate requirements based on job details
  async generateRequirements(jobTitle, experienceLevel, skills = []) {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      education: [
        "Bachelor's degree in relevant field or equivalent experience",
        "Relevant certifications preferred",
        "Continuous learning mindset"
      ],
      experience: experienceLevel === 'Entry Level' ? [
        "Fresh graduates welcome to apply",
        "Internship experience preferred",
        "Portfolio or project work demonstrating skills"
      ] : experienceLevel === 'Senior Level' ? [
        "5+ years of professional experience",
        "Proven track record of successful projects",
        "Leadership or mentoring experience preferred"
      ] : [
        "2-4 years of relevant experience",
        "Demonstrated proficiency in core skills",
        "Experience working in team environments"
      ],
      technical: skills.length > 0 ? [
        ...skills.map(skill => `Proficiency in ${skill}`),
        "Understanding of best practices and coding standards",
        "Experience with testing and debugging"
      ] : [
        "Strong technical foundation",
        "Familiarity with industry-standard tools",
        "Problem-solving abilities"
      ],
      personal: [
        "Excellent communication and interpersonal skills",
        "Strong analytical and problem-solving abilities",
        "Ability to work independently and in team settings",
        "Adaptability to changing requirements",
        "Passion for learning and professional growth"
      ],
      preferred: [
        "Experience with agile development methodologies",
        "Open source contributions",
        "Industry certifications",
        "Previous internship or project experience",
        "Strong portfolio demonstrating skills"
      ]
    };
  }

  // Analyze job posting for completeness and suggestions
  async analyzeJobPosting(jobData) {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    let score = 60;
    let strengths = [];
    let improvements = [];
    let missingFields = [];

    // Check completeness
    if (jobData.title) { score += 10; strengths.push("Clear job title provided"); }
    if (jobData.description) { score += 15; strengths.push("Job description included"); }
    if (jobData.requirements) { score += 10; strengths.push("Requirements specified"); }
    if (jobData.company) { score += 5; strengths.push("Company information provided"); }
    
    // Check for missing important fields
    if (!jobData.salary) {
      missingFields.push("salary");
      improvements.push({
        category: "salary",
        suggestion: "Add salary range to attract more qualified candidates",
        priority: "high"
      });
    }
    
    if (!jobData.benefits) {
      missingFields.push("benefits");
      improvements.push({
        category: "benefits",
        suggestion: "Include benefits and perks to make the position more attractive",
        priority: "medium"
      });
    }

    if (!jobData.location) {
      missingFields.push("location");
      improvements.push({
        category: "location",
        suggestion: "Specify work location or remote work options",
        priority: "high"
      });
    }

    return {
      completenessScore: Math.min(score, 95),
      strengths,
      improvements,
      missingFields,
      overallFeedback: "Your job posting has good foundation. Adding salary information and benefits would make it more competitive.",
      marketCompetitiveness: {
        score: 75,
        factors: ["Clear role definition", "Professional presentation"],
        suggestions: ["Add competitive salary", "Highlight growth opportunities", "Include company culture information"]
      }
    };
  }

  // Generate interview questions for the job role
  async generateInterviewQuestions(jobTitle, skills = [], experienceLevel = '') {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      technical: [
        {
          question: `Describe your experience with the key technologies mentioned for this ${jobTitle} role.`,
          difficulty: "easy",
          category: "experience"
        },
        {
          question: "Walk me through your approach to solving a complex problem you've encountered.",
          difficulty: "medium", 
          category: "problem-solving"
        },
        {
          question: "How do you stay updated with the latest trends and technologies in your field?",
          difficulty: "easy",
          category: "learning"
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time when you had to work under a tight deadline.",
          purpose: "Assesses time management and pressure handling"
        },
        {
          question: "Describe a situation where you had to collaborate with a difficult team member.",
          purpose: "Evaluates teamwork and conflict resolution skills"
        },
        {
          question: "What motivates you in your professional life?",
          purpose: "Understanding candidate's drive and cultural fit"
        }
      ],
      situational: [
        {
          question: "If you were assigned a project with unclear requirements, how would you proceed?",
          expectedAnswer: "Look for clarification, communication skills, structured approach"
        },
        {
          question: "How would you prioritize tasks when everything seems urgent?",
          expectedAnswer: "Systematic approach, stakeholder communication, impact assessment"
        }
      ]
    };
  }
}

module.exports = new MockGeminiService();
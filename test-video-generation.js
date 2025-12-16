require('dotenv').config(); // Load .env FIRST before any other requires
const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
const videoGenerator = require('./utils/videoGenerator');

// Test job data
const testJobData = {
  title: 'Full Stack Developer Intern',
  company: 'TechStart India',
  description: `We are looking for a talented Full Stack Developer Intern to join our growing team. 
You will work on exciting projects using React, Node.js, and MongoDB. 
This is a great opportunity to learn modern web development practices and contribute to real-world applications. 
You'll collaborate with experienced developers and gain hands-on experience in both frontend and backend development.`,
  requirements: [
    'Basic knowledge of JavaScript and React',
    'Understanding of REST APIs',
    'Good communication skills',
    'Enthusiasm to learn new technologies'
  ],
  responsibilities: [
    'Build responsive web interfaces using React',
    'Develop backend APIs with Node.js and Express',
    'Work with MongoDB database',
    'Collaborate with team members on projects'
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS'],
  location: 'Remote',
  type: 'internship',
  category: 'Technology',
  experience: '0-1 years',
  salary: '₹15,000 - ₹25,000/month',
  openings: 2,
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  status: 'active',
  isActive: true
};

// Test user (employer) data
const testEmployerData = {
  name: 'Tech Recruiter',
  email: 'recruiter@techstart.com',
  password: 'test123456',
  role: 'employer',
  companyName: 'TechStart India',
  companyWebsite: 'https://techstart.com'
};

async function createTestJobWithVideo() {
  try {
    console.log('\n🎬 Video Generation Test Script');
    console.log('================================\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected!\n');

    // Check or create test employer
    console.log('👤 Setting up test employer...');
    let employer = await User.findOne({ email: testEmployerData.email });
    
    if (!employer) {
      employer = await User.create(testEmployerData);
      console.log('✅ Test employer created!');
    } else {
      console.log('✅ Test employer already exists!');
    }
    console.log(`   Employer ID: ${employer._id}\n`);

    // Create job
    console.log('💼 Creating test job...');
    const job = await Job.create({
      ...testJobData,
      employer: employer._id
    });
    console.log('✅ Job created successfully!');
    console.log(`   Job ID: ${job._id}`);
    console.log(`   Title: ${job.title}\n`);

    // Generate video
    console.log('🎬 Starting video generation...');
    console.log('   This will take 30-60 seconds...\n');
    
    const videoResult = await videoGenerator.generateJobVideo(
      job.description,
      job.title
    );

    console.log('✅ Video generation started!');
    console.log(`   Video ID: ${videoResult.videoId}`);
    console.log(`   Status: ${videoResult.status}\n`);

    // Update job with video ID
    await Job.findByIdAndUpdate(job._id, {
      videoId: videoResult.videoId,
      videoStatus: 'processing'
    });

    // Poll for video completion
    console.log('⏳ Waiting for video to be ready...');
    await pollVideoStatus(job._id, videoResult.videoId);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Poll video status
async function pollVideoStatus(jobId, videoId, attempts = 0) {
  const maxAttempts = 20;
  const pollInterval = 5000; // 5 seconds

  try {
    const status = await videoGenerator.checkVideoStatus(videoId);

    if (status.status === 'done') {
      await Job.findByIdAndUpdate(jobId, {
        videoUrl: status.videoUrl,
        videoStatus: 'completed'
      });

      const job = await Job.findById(jobId);
      
      console.log('\n🎉 SUCCESS! Video is ready!\n');
      console.log('📊 Job Details:');
      console.log(`   Title: ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Job ID: ${job._id}`);
      console.log(`   Video URL: ${job.videoUrl}`);
      console.log(`   Video Status: ${job.videoStatus}\n`);
      console.log('✅ Video has been saved to MongoDB!');
      console.log('✅ You can now view this job in the frontend!\n');
      
      process.exit(0);

    } else if (status.status === 'error' || status.status === 'rejected') {
      await Job.findByIdAndUpdate(jobId, {
        videoStatus: 'failed'
      });
      console.error('\n❌ Video generation failed!\n');
      process.exit(1);

    } else if (attempts < maxAttempts) {
      process.stdout.write(`   ⏳ Processing... (${attempts * 5}s elapsed)\r`);
      setTimeout(() => {
        pollVideoStatus(jobId, videoId, attempts + 1);
      }, pollInterval);

    } else {
      await Job.findByIdAndUpdate(jobId, {
        videoStatus: 'failed'
      });
      console.error('\n⏱️ Timeout: Video took too long to generate\n');
      process.exit(1);
    }

  } catch (error) {
    console.error(`\n❌ Error checking video status: ${error.message}\n`);
    process.exit(1);
  }
}

// Check if D-ID API key is configured
if (!process.env.DID_API_KEY || process.env.DID_API_KEY === 'your_did_api_key_here') {
  console.error('❌ Error: D-ID API key not configured!');
  console.log('Please add DID_API_KEY to your .env file\n');
  process.exit(1);
}

// Run the test
createTestJobWithVideo();

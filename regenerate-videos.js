require('dotenv').config(); // Load .env FIRST
const mongoose = require('mongoose');
const Job = require('./models/Job');
const videoGenerator = require('./utils/videoGenerator');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Regenerate videos for existing jobs
async function regenerateVideosForExistingJobs() {
  try {
    console.log('🔍 Finding jobs without videos...\n');

    // Find all active jobs that don't have a video or failed
    const jobs = await Job.find({
      status: 'active',
      $or: [
        { videoUrl: null },
        { videoUrl: { $exists: false } },
        { videoStatus: 'failed' },
        { videoStatus: 'pending' }
      ]
    }).select('_id title description');

    console.log(`📊 Found ${jobs.length} jobs that need videos\n`);

    if (jobs.length === 0) {
      console.log('✅ All active jobs already have videos!');
      process.exit(0);
    }

    // Process each job
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`\n[${i + 1}/${jobs.length}] Processing: ${job.title}`);
      console.log(`Job ID: ${job._id}`);

      try {
        // Generate video
        console.log('  🎬 Generating video...');
        const videoResult = await videoGenerator.generateJobVideo(
          job.description,
          job.title
        );

        // Update job with video ID and status
        await Job.findByIdAndUpdate(job._id, {
          videoId: videoResult.videoId,
          videoStatus: 'processing'
        });

        console.log(`  ✅ Video generation started! Video ID: ${videoResult.videoId}`);
        
        // Start polling for this job
        pollVideoStatus(job._id, videoResult.videoId);
        
        successCount++;
        
        // Wait 2 seconds between requests to avoid rate limiting
        if (i < jobs.length - 1) {
          console.log('  ⏳ Waiting 2 seconds before next job...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        await Job.findByIdAndUpdate(job._id, {
          videoStatus: 'failed'
        });
        failCount++;
      }
    }

    console.log('\n\n📈 Summary:');
    console.log(`✅ Successfully started: ${successCount} videos`);
    console.log(`❌ Failed: ${failCount} videos`);
    console.log('\n⏳ Videos are being processed in background.');
    console.log('They will be ready in 30-60 seconds each.');
    console.log('Check the Job Details pages to see when they\'re complete!\n');

    // Keep process alive for polling
    console.log('🔄 Monitoring video generation status...');
    console.log('Press Ctrl+C to exit (videos will continue processing)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Poll video status until ready
async function pollVideoStatus(jobId, videoId, attempts = 0) {
  const maxAttempts = 20; // Max 2 minutes
  const pollInterval = 6000; // 6 seconds

  try {
    const status = await videoGenerator.checkVideoStatus(videoId);

    if (status.status === 'done') {
      // Video is ready
      await Job.findByIdAndUpdate(jobId, {
        videoUrl: status.videoUrl,
        videoStatus: 'completed'
      });
      console.log(`\n✅ Video ready for job ${jobId}`);
      console.log(`   URL: ${status.videoUrl}\n`);
    } else if (status.status === 'error' || status.status === 'rejected') {
      // Video failed
      await Job.findByIdAndUpdate(jobId, {
        videoStatus: 'failed'
      });
      console.error(`\n❌ Video failed for job ${jobId}\n`);
    } else if (attempts < maxAttempts) {
      // Still processing, check again
      if (attempts % 3 === 0) {
        console.log(`  ⏳ Still processing video for job ${jobId}... (${attempts * 6}s)`);
      }
      setTimeout(() => {
        pollVideoStatus(jobId, videoId, attempts + 1);
      }, pollInterval);
    } else {
      // Timeout
      await Job.findByIdAndUpdate(jobId, {
        videoStatus: 'failed'
      });
      console.error(`\n⏱️ Timeout: Video generation took too long for job ${jobId}\n`);
    }
  } catch (error) {
    console.error(`\n❌ Error polling video status for ${jobId}: ${error.message}\n`);
  }
}

// Run the script
console.log('🎬 AI Video Regeneration Script');
console.log('================================\n');

if (!process.env.DID_API_KEY) {
  console.error('❌ Error: DID_API_KEY not found in .env file');
  console.log('Please add your D-ID API key to backend/.env\n');
  process.exit(1);
}

console.log('✅ D-ID API key found\n');
regenerateVideosForExistingJobs();

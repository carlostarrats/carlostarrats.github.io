import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thayer's 8 emotion categories
const EMOTIONS = {
  Happy: 'Happy',
  Exuberant: 'Exuberant',
  Energetic: 'Energetic',
  Frantic: 'Frantic',
  Anxious: 'Anxious/Sad',
  Depression: 'Depression',
  Calm: 'Calm',
  Contentment: 'Contentment'
};

// Store aggregated song data
const songData = new Map();

// Parse CSV and aggregate song statistics
function processCSV() {
  const csvPath = path.join(__dirname, '../../Apple Music Activity/Apple Music - Play History Daily Tracks.csv');
  
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        console.log(`Processing ${results.length} listening events...`);
        
        results.forEach(row => {
          const trackId = row['Track Identifier'];
          const description = row['Track Description'];
          const duration = parseInt(row['Play Duration Milliseconds']) || 0;
          const endReason = row['End Reason Type'];
          const hour = parseInt(row['Hours']) || 12;
          
          if (!trackId || !description || description === 'N/A') return;
          
          // Parse artist - song from description
          const parts = description.split(' - ');
          if (parts.length < 2) return;
          
          const artist = parts[0].trim();
          const title = parts.slice(1).join(' - ').trim();
          
          if (!songData.has(trackId)) {
            songData.set(trackId, {
              trackId,
              artist,
              title,
              totalDuration: 0,
              playCount: 0,
              skipCount: 0,
              naturalEndCount: 0,
              hourCounts: Array(24).fill(0),
              durations: []
            });
          }
          
          const song = songData.get(trackId);
          song.playCount++;
          song.totalDuration += duration;
          song.durations.push(duration);
          song.hourCounts[hour]++;
          
          // Track completion vs skips
          if (endReason === 'NATURAL_END_OF_TRACK') {
            song.naturalEndCount++;
          } else if (endReason && endReason.includes('SKIP') || endReason.includes('MANUALLY_SELECTED')) {
            song.skipCount++;
          }
        });
        
        resolve();
      })
      .on('error', reject);
  });
}

// Calculate emotion scores based on behavioral patterns
function calculateEmotions(song) {
  const avgDuration = song.totalDuration / song.playCount;
  const completionRate = song.naturalEndCount / song.playCount;
  const skipRate = song.skipCount / song.playCount;
  
  // Calculate time of day pattern (0-1, higher = more late night plays)
  const lateNightPlays = (song.hourCounts[22] + song.hourCounts[23] + song.hourCounts[0] + song.hourCounts[1] + song.hourCounts[2]) / song.playCount;
  const morningPlays = (song.hourCounts[6] + song.hourCounts[7] + song.hourCounts[8] + song.hourCounts[9]) / song.playCount;
  const afternoonPlays = (song.hourCounts[12] + song.hourCounts[13] + song.hourCounts[14] + song.hourCounts[15]) / song.playCount;
  
  // Energy indicators (0-1 scale)
  // High completion rate + repeated plays = higher energy
  const energyFromCompletion = completionRate;
  const energyFromRepeats = Math.min(song.playCount / 20, 1); // Normalize to 20 plays
  const energy = (energyFromCompletion * 0.6 + energyFromRepeats * 0.4);
  
  // Stress indicators (0-1 scale)
  // High skip rate = higher stress, late night = lower stress
  const stressFromSkips = skipRate;
  const stressFromTime = 1 - (lateNightPlays * 0.7); // Late night reduces stress
  const stress = (stressFromSkips * 0.5 + stressFromTime * 0.5);
  
  // Engagement score
  const engagement = Math.min((song.playCount / 15) * completionRate, 1);
  
  // Calculate emotion scores using Thayer's model
  const emotionScores = {};
  
  // High energy + Low stress quadrant
  emotionScores[EMOTIONS.Happy] = Math.max(0, energy * (1 - stress) * (morningPlays > 0.2 ? 1.2 : 1));
  emotionScores[EMOTIONS.Exuberant] = Math.max(0, energy * (1 - stress) * engagement * 1.1);
  
  // High energy + High stress quadrant
  emotionScores[EMOTIONS.Energetic] = Math.max(0, energy * stress * (afternoonPlays > 0.2 ? 1.2 : 1));
  emotionScores[EMOTIONS.Frantic] = Math.max(0, energy * stress * skipRate * 1.3);
  
  // Low energy + High stress quadrant
  emotionScores[EMOTIONS.Anxious] = Math.max(0, (1 - energy) * stress * (lateNightPlays > 0.3 ? 1.3 : 1));
  emotionScores[EMOTIONS.Depression] = Math.max(0, (1 - energy) * stress * (1 - engagement));
  
  // Low energy + Low stress quadrant
  emotionScores[EMOTIONS.Calm] = Math.max(0, (1 - energy) * (1 - stress) * (lateNightPlays > 0.3 ? 1.3 : 1));
  emotionScores[EMOTIONS.Contentment] = Math.max(0, (1 - energy) * (1 - stress) * engagement);
  
  // Normalize scores to ensure at least one meaningful score
  const maxScore = Math.max(...Object.values(emotionScores));
  if (maxScore > 0) {
    Object.keys(emotionScores).forEach(key => {
      emotionScores[key] = Math.min(emotionScores[key] / maxScore, 1);
    });
  }
  
  // Find primary emotion
  let primaryEmotion = EMOTIONS.Calm;
  let maxEmotionScore = 0;
  Object.entries(emotionScores).forEach(([emotion, score]) => {
    if (score > maxEmotionScore) {
      maxEmotionScore = score;
      primaryEmotion = emotion;
    }
  });
  
  return {
    energy: Math.min(energy, 1),
    emotionScores,
    primaryEmotion,
    completionRate,
    skipRate,
    engagement
  };
}

// Generate output JSON
async function generateJSON() {
  await processCSV();
  
  const songs = [];
  let songId = 1;
  
  // Filter songs with meaningful data (at least 2 plays)
  songData.forEach((song) => {
    if (song.playCount < 2) return;
    
    const emotions = calculateEmotions(song);
    
    songs.push({
      id: String(songId++),
      trackId: song.trackId,
      title: song.title,
      artist: song.artist,
      energy: emotions.energy,
      primaryEmotion: emotions.primaryEmotion,
      emotionScores: emotions.emotionScores,
      playCount: song.playCount,
      skipCount: song.skipCount,
      completionRate: Math.round(emotions.completionRate * 100),
      dataSource: 'apple'
    });
  });
  
  // Sort by play count descending
  songs.sort((a, b) => b.playCount - a.playCount);
  
  // Use ALL songs with meaningful data
  const outputSongs = songs;
  
  console.log(`\nGenerated ${outputSongs.length} songs with emotion data`);
  console.log('\nEmotion distribution:');
  const emotionCounts = {};
  outputSongs.forEach(song => {
    emotionCounts[song.primaryEmotion] = (emotionCounts[song.primaryEmotion] || 0) + 1;
  });
  Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]).forEach(([emotion, count]) => {
    console.log(`  ${emotion}: ${count} songs`);
  });
  
  // Write to JSON file
  const outputPath = path.join(__dirname, '../src/data/appleMusicSongs.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputSongs, null, 2));
  console.log(`\nData written to: ${outputPath}`);
}

// Run the script
generateJSON().catch(err => {
  console.error('Error processing data:', err);
  process.exit(1);
});


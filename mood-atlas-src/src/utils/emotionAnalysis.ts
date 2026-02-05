// Shared emotion analysis utilities based on Thayer's arousal-valence model
// Used by both offlineMode.ts and deezerCharts.ts

/**
 * Analyzes energy and valence values to determine primary emotion
 * Based on Thayer's arousal-valence model:
 * - High energy + High valence = Happy/Energetic
 * - High energy + Low valence = Angry/Frantic
 * - Low energy + High valence = Peaceful/Calm
 * - Low energy + Low valence = Sad/Melancholic
 */
export function analyzeSongEmotion(energy: number, valence: number): string {
  if (energy > 0.7 && valence > 0.7) return 'Happy';
  if (energy > 0.7 && valence > 0.4) return 'Energetic';
  if (energy > 0.7 && valence <= 0.4) return 'Angry';
  if (energy > 0.4 && valence > 0.7) return 'Excited';
  if (energy > 0.4 && valence > 0.4) return 'Romantic';
  if (energy <= 0.4 && valence > 0.5) return 'Peaceful';
  if (energy <= 0.4 && valence > 0.3) return 'Calm';
  if (energy > 0.3 && valence <= 0.4) return 'Melancholic';
  return 'Sad';
}

/**
 * Generate emotion scores for all emotions based on energy/valence
 */
export function generateEmotionScores(energy: number, valence: number): Record<string, number> {
  const emotions = ['Happy', 'Energetic', 'Excited', 'Romantic', 'Calm', 'Peaceful', 'Sad', 'Melancholic', 'Angry'];
  const scores: Record<string, number> = {};

  emotions.forEach(emotion => {
    let score = 0.1;
    switch (emotion) {
      case 'Happy': score = (energy > 0.5 ? 0.5 : 0.2) + (valence * 0.5); break;
      case 'Energetic': score = energy * 0.8 + (valence > 0.4 ? 0.2 : 0); break;
      case 'Excited': score = (energy * 0.5) + (valence * 0.5); break;
      case 'Romantic': score = (1 - Math.abs(energy - 0.5)) * 0.5 + valence * 0.3; break;
      case 'Calm': score = (1 - energy) * 0.6 + (valence > 0.4 ? 0.4 : 0.2); break;
      case 'Peaceful': score = (1 - energy) * 0.5 + valence * 0.4; break;
      case 'Sad': score = (1 - valence) * 0.7 + (energy < 0.5 ? 0.3 : 0); break;
      case 'Melancholic': score = (1 - valence) * 0.5 + (energy * 0.3); break;
      case 'Angry': score = energy * 0.7 + (1 - valence) * 0.3; break;
    }
    scores[emotion] = Math.max(0.1, Math.min(1.0, score));
  });

  return scores;
}

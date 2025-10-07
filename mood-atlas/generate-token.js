// Simple JWT token generator for Apple Music
// Run with: node generate-token.js

const crypto = require('crypto');
const fs = require('fs');

// Replace these with your actual values
const TEAM_ID = 'YOUR_TEAM_ID_HERE'; // 10 characters
const KEY_ID = 'YOUR_KEY_ID_HERE';   // 10 characters
const PRIVATE_KEY_PATH = './AuthKey_XXXXXXXXXX.p8'; // Path to your .p8 file

function generateJWT() {
  try {
    // Read the private key
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    
    // Create header
    const header = {
      alg: 'ES256',
      kid: KEY_ID
    };
    
    // Create payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: TEAM_ID,
      iat: now,
      exp: now + (6 * 30 * 24 * 60 * 60) // 6 months
    };
    
    // Create JWT
    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createSign('RSA-SHA256')
      .update(`${headerB64}.${payloadB64}`)
      .sign(privateKey, 'base64url');
    
    const token = `${headerB64}.${payloadB64}.${signature}`;
    
    console.log('🎵 Your Apple Music JWT Token:');
    console.log(token);
    console.log('\n📝 Copy this token to your .env file:');
    console.log(`VITE_MUSICKIT_TOKEN=${token}`);
    
  } catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.log('\n📋 Make sure you have:');
    console.log('1. Downloaded the .p8 file from Apple Developer Portal');
    console.log('2. Updated TEAM_ID and KEY_ID in this script');
    console.log('3. Updated PRIVATE_KEY_PATH to point to your .p8 file');
  }
}

generateJWT();
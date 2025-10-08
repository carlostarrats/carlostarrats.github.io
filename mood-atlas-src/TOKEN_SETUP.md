# 🎵 Apple Music Token Setup

## Option 1: Use Online Tool (Easiest)

1. **Go to** [JWT.io](https://jwt.io)
2. **Select Algorithm**: ES256
3. **Header**:
   ```json
   {
     "alg": "ES256",
     "kid": "YOUR_KEY_ID_HERE"
   }
   ```
4. **Payload**:
   ```json
   {
     "iss": "YOUR_TEAM_ID_HERE",
     "iat": 1700000000,
     "exp": 1700000000
   }
   ```
5. **Private Key**: Paste content from your `.p8` file
6. **Copy the generated token**

## Option 2: Use Node.js Script

1. **Update the values** in `generate-token.js`:
   - `TEAM_ID`: Your 10-character Team ID
   - `KEY_ID`: Your 10-character Key ID  
   - `PRIVATE_KEY_PATH`: Path to your `.p8` file

2. **Run the script**:
   ```bash
   node generate-token.js
   ```

## Update .env File

Once you have your token, update `.env`:

```bash
VITE_MUSICKIT_TOKEN=your_actual_jwt_token_here
VITE_MUSICKIT_STOREFRONT=us
VITE_MUSICKIT_TEAM_ID=your_actual_team_id_here
```

## Test the Connection

1. **Restart the dev server** (it should auto-restart when .env changes)
2. **Go to** http://localhost:3001
3. **Click "Download for Offline"**
4. **Sign in** with your Apple Music account


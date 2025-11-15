# Quick Setup Guide

Follow these steps to get Screen Chatter AI working:

## Step 1: Get Your Google AI API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key (it starts with `AIza...`)

## Step 2: Set Up Supabase Secret

You need to add your Google AI API key to Supabase so the Edge Function can use it.

### Method A: Using Supabase CLI (Easiest)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref yunsheqekpywelmpzawz

# Set the secret (replace YOUR_KEY with your actual Google AI API key)
supabase secrets set GOOGLE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY_HERE

# Deploy the edge function
supabase functions deploy generate-chat
```

### Method B: Using Supabase Dashboard

1. Visit https://app.supabase.com/project/yunsheqekpywelmpzawz/settings/functions
2. Click on "Edge Functions" in the sidebar
3. Click "Manage Secrets" or "Secrets" tab
4. Add a new secret:
   - Name: `GOOGLE_AI_API_KEY`
   - Value: `YOUR_GOOGLE_AI_API_KEY_HERE`
5. Save the secret
6. Deploy the function via dashboard or CLI:
   ```bash
   supabase functions deploy generate-chat
   ```

## Step 3: Run the App

```bash
# Install dependencies (if you haven't)
npm install

# Start development server
npm run dev
```

## Step 4: Test It Out

1. Open the app in your browser (usually http://localhost:8080)
2. Click "Capture Screen" and select a window/screen
3. Click "Start" to begin generating AI chat messages
4. Watch the chat come alive!

## Troubleshooting

### "GOOGLE_AI_API_KEY is not configured" Error

This means the secret wasn't set correctly in Supabase. Double-check:
- The secret name is exactly `GOOGLE_AI_API_KEY` (case-sensitive)
- The API key is valid (test it at https://aistudio.google.com)
- You deployed the edge function after setting the secret

### Function Not Found Error

Deploy the edge function:
```bash
supabase functions deploy generate-chat
```

### Still Having Issues?

Check:
1. Browser console (F12) for error messages
2. Supabase dashboard logs: https://app.supabase.com/project/yunsheqekpywelmpzawz/logs/edge-functions
3. Make sure your `.env` file has the correct Supabase credentials

## Need Help?

Open an issue on GitHub or check the main README.md for more details.

# XAUUSD Chart Analyzer

AI-powered trading plan generator for XAUUSD (Gold) charts using Claude 3.5 Sonnet Vision and market data integration.

## Features

✨ **Drag & Drop Chart Upload** - Intuitive file upload to Supabase Storage

📊 **Real-time Market Data** - Fetch last 50 candles from Twelve Data API

🤖 **Claude Vision Analysis** - AI-powered technical analysis with entry/TP/SL

💾 **Persistent Storage** - Save analysis history to Supabase database

🎨 **Clean UI** - Beautiful results card with risk/reward calculation

🔐 **Secure Authentication** - Supabase RLS policies for data privacy

## Tech Stack

- **Frontend**: Next.js 13+, React, Tailwind CSS, Lucide Icons
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Claude 3.5 Sonnet (Vision)
- **Market Data**: Twelve Data API

## Setup Instructions

### 1. Create Next.js Project

```bash
npx create-next-app@latest chart-analyse --typescript --tailwind
cd chart-analyse
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk lucide-react
```

### 3. Set Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
TWELVE_DATA_API_KEY=your_twelve_data_api_key
```

### 4. Setup Supabase Database

1. Create a new Supabase project
2. Run the SQL schema from `supabase_schema.sql`
3. Enable RLS on the storage bucket

### 5. Create Directory Structure

```bash
mkdir -p app/api/{market-data,analyze}
mkdir -p components hooks lib
```

### 6. Copy Files

Copy all component, hook, and API files from the implementation.

### 7. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## API Routes

### POST /api/market-data
Fetches XAUUSD market data from Twelve Data API

**Request:**
```json
{ "timeframe": "1h" }
```

**Response:**
```json
{
  "symbol": "XAUUSD",
  "timeframe": "1h",
  "candles": [...]
}
```

### POST /api/analyze
Analyzes chart and market data with Claude Vision

**Request:**
```json
{
  "imageUrl": "https://...",
  "timeframe": "1h",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "bias": "BULLISH",
    "entry": 2050.50,
    "tp": 2075.00,
    "sl": 2025.00,
    "reasoning": "..."
  },
  "savedId": "uuid"
}
```

## Error Handling

✅ File type & size validation
✅ API failure recovery
✅ JSON parsing with regex extraction
✅ Market data fallback
✅ Database transaction safety
✅ User authentication via RLS

## Database Schema

The `analyses` table stores:
- User ID (with RLS enforcement)
- Image URL
- Timeframe
- Trading plan (bias, entry, TP, SL)
- Analysis reasoning
- Raw market data (JSONB)
- Timestamps

## License

MIT

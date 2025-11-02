import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if API keys are set in environment variables
  const geminiKey = process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET';
  const googleGeminiKey = process.env.GOOGLE_GEMINI_API_KEY ? 'SET' : 'NOT SET';
  
  // Get the first and last few characters of keys for debugging (without revealing the full key)
  const geminiKeyPreview = process.env.GEMINI_API_KEY 
    ? `${process.env.GEMINI_API_KEY.substring(0, 5)}...${process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 5)}`
    : 'NOT SET';
    
  const googleGeminiKeyPreview = process.env.GOOGLE_GEMINI_API_KEY 
    ? `${process.env.GOOGLE_GEMINI_API_KEY.substring(0, 5)}...${process.env.GOOGLE_GEMINI_API_KEY.substring(process.env.GOOGLE_GEMINI_API_KEY.length - 5)}`
    : 'NOT SET';

  return NextResponse.json({
    geminiKeyStatus: geminiKey,
    googleGeminiKeyStatus: googleGeminiKey,
    geminiKeyPreview,
    googleGeminiKeyPreview,
    // Check for other possible environment variable names
    nextPublicGeminiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'SET' : 'NOT SET',
    geminiApiKey: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
  });
}
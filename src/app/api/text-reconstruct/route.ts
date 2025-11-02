import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text input is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `You are an expert in internet history, linguistics, and digital archaeology.

Your task: Reconstruct the following fragmented text from a historical digital source.

FRAGMENT: "${text}"

Instructions:
1. Fill in missing words, expand abbreviations, and complete incomplete phrases
2. Infer the likely era (1990s, 2000s, 2010s, 2020s) based on slang and style
3. Identify the community or context (gaming, social media, forums, AOL chat, etc.)
4. Provide EXACTLY the following outputs:
   - MOST_LIKELY: The most probable full reconstruction
   - CONFIDENCE: A percentage (0-100) for your confidence
   - ALTERNATIVES: 1-2 other plausible interpretations with their confidence scores
   - ERA: The likely time period
   - COMMUNITY: The likely community or platform
   - KEY_TERMS: List of slang/abbreviations expanded with their meanings
   - REASONING: Why did you make these reconstruction choices?

Format your response as valid JSON with this exact structure:
{
  "mostLikely": "reconstructed text here",
  "confidence": 85,
  "alternatives": [
    {"text": "alternative 1", "confidence": 72},
    {"text": "alternative 2", "confidence": 65}
  ],
  "era": "2010s",
  "community": "Instagram/TikTok culture",
  "keyTerms": [
    {"original": "omg", "expanded": "oh my god", "meaning": "expression of surprise"}
  ],
  "reasoning": "explanation here"
}

Respond ONLY with valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse the JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response', rawResponse: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
      originalText: text,
    });
  } catch (error) {
    console.error('Reconstruction error:', error);
    return NextResponse.json(
      { error: 'Failed to reconstruct text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
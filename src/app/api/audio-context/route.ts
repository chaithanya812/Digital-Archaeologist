import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topics, entities } = await request.json();

    if (!topics?.length && !entities?.length) {
      return NextResponse.json(
        { error: 'No topics or entities provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Combine topics and entities for context generation
    const searchTerms = [...(topics || []), ...(entities || [])].slice(0, 5);

    // Use Gemini to generate contextual information about topics/entities
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Act as a research specialist. Given the following topics and entities from a transcription, provide 4-6 highly relevant and insightful contextual sources.

Topics and Entities: ${searchTerms.join(', ')}

For each topic/entity, provide:
1. An engaging title that captures the essence
2. A comprehensive 3-4 sentence explanation with key insights
3. Clear relevance to understanding the transcription context
4. Any interesting connections or implications

Format your response as a JSON array with objects containing: title, snippet, relevance_score (0-1)

Example format:
[
  {
    "title": "Understanding [Topic]: Key Insights and Implications",
    "snippet": "Detailed explanation with insights...",
    "relevance_score": 0.95
  }
]

Provide ONLY the JSON array, no additional text.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to search context', details: errorData, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    const responseText = result.candidates[0]?.content?.parts[0]?.text || '';
    
    // Parse the JSON response
    let sources;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      
      sources = parsed.map((item: any, index: number) => ({
        title: item.title || `Context ${index + 1}`,
        url: '#', // No actual URL since we're generating context, not searching
        snippet: item.snippet || '',
        score: item.relevance_score || 0.8,
      }));
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback: create generic sources
      sources = searchTerms.map((term, index) => ({
        title: `About ${term}`,
        url: '#',
        snippet: `Context and information about ${term}`,
        score: 0.8 - (index * 0.1),
      }));
    }

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Search context error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
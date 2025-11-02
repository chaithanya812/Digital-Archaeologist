import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'No transcription provided' },
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

    // Call Gemini API for text reconstruction
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
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
                  text: `Act as an expert analyst and communication specialist. Your task is to deeply analyze the following transcription and provide comprehensive insights.

First, reconstruct the transcription by:
1. Expanding all slang, abbreviations, and informal language into proper full context
2. Correcting grammar and structure while preserving original meaning
3. Clarifying unclear references and providing context
4. Organizing information coherently for better readability

Then, provide a detailed analysis including:
1. Key Themes: Main ideas and recurring concepts (be specific and insightful)
2. Important Entities: People, places, organizations, products mentioned (with brief context)
3. Communication Style: Tone, formality level, and speaking patterns
4. Contextual Insights: Cultural references, technical terms, or domain-specific elements
5. Sentiment Analysis: Overall emotional tone and key emotional shifts
6. Action Items: Any tasks, decisions, or follow-ups mentioned

Original Transcription:
${transcription}

Format your response exactly as:
===RECONSTRUCTED TEXT===
[Full, clear, properly formatted version]

===KEY THEMES===
[Detailed themes with brief explanations]

===IMPORTANT ENTITIES===
[Entities with context]

===COMMUNICATION STYLE===
[Tone, formality, and patterns]

===CONTEXTUAL INSIGHTS===
[Cultural, technical, or domain references]

===SENTIMENT ANALYSIS===
[Emotional tone and shifts]

===ACTION ITEMS===
[Any tasks or decisions]`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response status text:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to reconstruct text', details: errorData, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the structured response
    const sections = {
      reconstructedText: '',
      keyTopics: [] as string[],
      entities: [] as string[],
      contextNotes: '',
      communicationStyle: '',
      sentimentAnalysis: '',
      actionItems: '',
    };

    const reconstructedMatch = result.match(/===RECONSTRUCTED TEXT===\s*([\s\S]*?)(?=\n===|$)/);
    const themesMatch = result.match(/===KEY THEMES===\s*([\s\S]*?)(?=\n===|$)/);
    const entitiesMatch = result.match(/===IMPORTANT ENTITIES===\s*([\s\S]*?)(?=\n===|$)/);
    const styleMatch = result.match(/===COMMUNICATION STYLE===\s*([\s\S]*?)(?=\n===|$)/);
    const insightsMatch = result.match(/===CONTEXTUAL INSIGHTS===\s*([\s\S]*?)(?=\n===|$)/);
    const sentimentMatch = result.match(/===SENTIMENT ANALYSIS===\s*([\s\S]*?)(?=\n===|$)/);
    const actionsMatch = result.match(/===ACTION ITEMS===\s*([\s\S]*?)$/);

    if (reconstructedMatch) {
      sections.reconstructedText = reconstructedMatch[1].trim();
    }
    if (themesMatch) {
      // Extract themes as an array of detailed descriptions
      sections.keyTopics = themesMatch[1]
        .split('\n')
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    if (entitiesMatch) {
      // Extract entities as an array of detailed descriptions
      sections.entities = entitiesMatch[1]
        .split('\n')
        .map((e: string) => e.trim())
        .filter(Boolean);
    }
    if (insightsMatch) {
      sections.contextNotes = insightsMatch[1].trim();
    }
    if (styleMatch) {
      sections.communicationStyle = styleMatch[1].trim();
    }
    if (sentimentMatch) {
      sections.sentimentAnalysis = sentimentMatch[1].trim();
    }
    if (actionsMatch) {
      sections.actionItems = actionsMatch[1].trim();
    }

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Reconstruction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
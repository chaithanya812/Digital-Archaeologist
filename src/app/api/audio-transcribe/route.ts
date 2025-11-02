import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
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

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    
    // Validate that we have actual data
    if (!base64Audio || base64Audio.length === 0) {
      return NextResponse.json(
        { error: 'Failed to process audio file - no data available' },
        { status: 400 }
      );
    }
    
    // Validate and set MIME type - only common audio types are supported
    let mimeType = audioFile.type || 'audio/mpeg';
    const supportedTypes = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/aac'];
    
    if (!supportedTypes.includes(mimeType)) {
      // Default to mpeg if MIME type is not supported
      mimeType = 'audio/mpeg';
      console.warn(`Unsupported MIME type ${audioFile.type} detected. Defaulting to audio/mpeg.`);
    }

    // Call Gemini API with native audio support
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
                  text: "Transcribe this audio accurately. Handle poor quality audio, background noise, fast speech, unclear pronunciation, accents, multiple speakers, and damaged recordings. Provide the best possible transcription despite audio quality issues. Include all speech, even if unclear or overlapping.",
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
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
        { error: 'Failed to transcribe audio', details: errorData, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({
      transcription,
      fileName: audioFile.name,
      fileSize: audioFile.size,
      mimeType,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
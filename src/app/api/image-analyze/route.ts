import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API key not configured" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")

    // Validate that we have actual data
    if (!base64Image || base64Image.length === 0) {
      return NextResponse.json(
        { error: "Failed to process image file - no data available" },
        { status: 400 }
      );
    }

    // Validate and set MIME type - only image/png, image/jpeg, image/webp are supported
    let mimeType = imageFile.type || 'image/jpeg'; // Default if type is missing
    const supportedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    
    if (!supportedTypes.includes(mimeType)) {
      // Try to infer MIME type from file extension if possible
      const fileName = imageFile.name?.toLowerCase() || '';
      if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else {
        // Default to jpeg for all other cases
        mimeType = 'image/jpeg';
      }
      console.warn(`Unsupported MIME type ${imageFile.type} detected. Defaulting to ${mimeType}.`);
    }

    // Initialize Gemini with the stable vision model
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Craft detailed archaeological analysis prompt
    const prompt = `You are a digital archaeologist analyzing historical internet artifacts. Analyze this image comprehensively and provide a detailed archaeological report in JSON format.

Your analysis should include:

1. **Era Identification**: Determine the approximate time period (e.g., "Early Web 1.0 (1995-2000)", "Web 2.0 Peak (2006-2010)", "Mobile-First Era (2012-2016)", "Modern Era (2017-present)")

2. **Platform Detection**: Identify the platform, application, or website shown. Include version details if recognizable.

3. **Design Analysis**: Analyze visual design elements including:
   - Color schemes and palettes
   - Typography choices
   - Layout patterns (tables, grids, flexbox indicators)
   - UI paradigms (skeuomorphic, flat, material design, etc.)
   - Notable design trends of that era

4. **Cultural Context**: Provide historical and cultural significance:
   - What was happening in tech/internet culture at this time
   - Social/cultural movements reflected in the design
   - User behavior patterns this design encouraged
   - How this artifact fits into internet history

5. **Technical Observations**: Note technical details such as:
   - Screen resolution indicators
   - Browser chrome/UI elements
   - Technology stack hints (Flash, Java applets, HTML tables, CSS frameworks)
   - Performance considerations visible in the design

6. **Authenticity Assessment**: Evaluate if this is an original artifact, recreation, or modern interpretation

7. **Historical Significance**: Rate the significance (1-10) and explain why this artifact matters to internet history

Return ONLY valid JSON in this exact structure:
{
  "era": {
    "period": "string",
    "yearRange": "string",
    "confidence": "high/medium/low"
  },
  "platform": {
    "name": "string",
    "type": "string (website/application/OS/game/etc)",
    "version": "string or null"
  },
  "design": {
    "colorScheme": "string description",
    "typography": "string description",
    "layoutStyle": "string description",
    "designParadigm": "string (skeuomorphic/flat/etc)",
    "notableElements": ["array of strings"]
  },
  "cultural": {
    "historicalContext": "string (2-3 sentences)",
    "culturalSignificance": "string (2-3 sentences)",
    "userBehaviorPatterns": "string (1-2 sentences)"
  },
  "technical": {
    "resolution": "string or null",
    "browserIndicators": "string or null",
    "technologyStack": ["array of strings"],
    "performanceNotes": "string or null"
  },
  "authenticity": {
    "assessment": "original/recreation/modern/unclear",
    "confidence": "high/medium/low",
    "reasoning": "string"
  },
  "significance": {
    "rating": number (1-10),
    "explanation": "string (2-3 sentences)"
  },
  "summary": "string (A compelling 2-3 sentence summary of the artifact's importance)"
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    // Parse JSON from response (handle markdown code blocks if present)
    let analysisData
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/)
      const jsonText = jsonMatch ? jsonMatch[1] : text
      analysisData = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse JSON:", text)
      return NextResponse.json(
        { error: "Failed to parse analysis result", rawResponse: text },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { 
        error: "Failed to analyze image", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
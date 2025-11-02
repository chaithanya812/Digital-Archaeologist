import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context, analysisType } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API key not configured" },
        { status: 500 }
      )
    }

    // Initialize Gemini with the stable model
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    // Craft a prompt based on the analysis type
    let prompt = ""
    
    switch (analysisType) {
      case "audio":
        prompt = `You are an AI assistant helping users understand their audio analysis results. 
        Use the following context to answer the user's question accurately and helpfully:

        ${context || "No specific context provided."}

        User's question: ${message}

        Please provide a clear, concise, and helpful response about the audio analysis. 
        Focus on the transcription, reconstructed text, key topics, entities, and other audio-specific insights.`
        break
        
      case "text":
        prompt = `You are an AI assistant helping users understand their text analysis results. 
        Use the following context to answer the user's question accurately and helpfully:

        ${context || "No specific context provided."}

        User's question: ${message}

        Please provide a clear, concise, and helpful response about the text analysis. 
        Focus on the reconstructed text, era, community, key terms, and other text-specific insights.`
        break
        
      case "image":
        prompt = `You are an AI assistant helping users understand their image analysis results. 
        Use the following context to answer the user's question accurately and helpfully:

        ${context || "No specific context provided."}

        User's question: ${message}

        Please provide a clear, concise, and helpful response about the image analysis. 
        Focus on the era, platform, design elements, cultural context, and other image-specific insights.`
        break
        
      default:
        prompt = `You are an AI assistant helping users with their analysis results. 
        Use the following context to answer the user's question accurately and helpfully:

        ${context || "No specific context provided."}

        User's question: ${message}

        Please provide a clear, concise, and helpful response.`
    }

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      success: true,
      response: text,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate response", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
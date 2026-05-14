
import { NextResponse } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';
const TIMEOUT_MS = 60000; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { reply: "Invalid request: 'message' must be a non-empty string." },
        { status: 400 }
      );
    }

    const body = {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional cricket talent assistant for Path of Cricket Sri Lanka. Provide helpful, accurate information about tryouts, training programs, eligibility, coaching, talent scouting, fees, and other cricket queries. Be concise, friendly, and supportive.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
      options: {
        temperature: 0.7,
        num_predict: 500,
      },
      stream: false, 
    };


    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); 

      if (!response.ok) {
        
        const errorText = await response.text();
        console.error('Ollama API error:', response.status, errorText);
        return NextResponse.json(
          { reply: "The AI service returned an error. Please try again." },
          { status: 502 }
        );
      }

      const data = await response.json();
      const reply = data.message?.content || 'No response from AI.';

      return NextResponse.json({ reply });
    } catch (error: any) {
      clearTimeout(timeoutId); 

      if (error.name === 'AbortError') {
        console.error('Ollama request timed out');
        return NextResponse.json(
          { reply: "The AI service is taking too long to respond. Please try again later." },
          { status: 504 }
        );
      }

     
      console.error('Fetch error:', error);
      return NextResponse.json(
        { reply: "Unable to reach the AI service. Please check if Ollama is running." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { reply: "Invalid request format." },
      { status: 400 }
    );
  }
}
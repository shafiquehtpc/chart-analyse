import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

interface MarketData {
  symbol: string;
  timeframe: string;
  candles: Array<{
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

interface AnalysisResult {
  bias: string;
  entry: number;
  tp: number;
  sl: number;
  reasoning: string;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, timeframe, userId } = await request.json();

    if (!imageUrl || !timeframe || !userId) {
      return NextResponse.json(
        { error: "imageUrl, timeframe, and userId are required" },
        { status: 400 }
      );
    }

    // Fetch market data
    const marketDataResponse = await fetch(
      new URL("/api/market-data", request.url),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe }),
      }
    );

    if (!marketDataResponse.ok) {
      throw new Error("Failed to fetch market data");
    }

    const marketData = (await marketDataResponse.json()) as MarketData;

    // Initialize Anthropic client
    const client = new Anthropic();

    // Construct the prompt
    const prompt = `You are an expert XAUUSD (Gold) trader analyzing chart screenshots and market data.

I have provided:
1. A screenshot of a XAUUSD chart
2. The last 50 candles of XAUUSD market data in JSON format

Based on this information, provide a trading plan with:
- Bias: "BULLISH", "BEARISH", or "NEUTRAL"
- Entry: Entry price (as a number)
- TP (Take Profit): Target price
- SL (Stop Loss): Stop loss price
- Reasoning: Brief explanation of your analysis

Market Data (Last 50 Candles):
${JSON.stringify(marketData.candles, null, 2)}

Analyze the chart image carefully and combine it with the market data to generate your trading plan.

You MUST respond ONLY with valid JSON in this exact format:
{
  "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "entry": number,
  "tp": number,
  "sl": number,
  "reasoning": "string"
}

Do not include any text before or after the JSON object.`;

    // Call Claude API with vision
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract the text response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response
    let analysis: AnalysisResult;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: responseText },
        { status: 400 }
      );
    }

    // Validate analysis structure
    if (
      !analysis.bias ||
      typeof analysis.entry !== "number" ||
      typeof analysis.tp !== "number" ||
      typeof analysis.sl !== "number" ||
      !analysis.reasoning
    ) {
      return NextResponse.json(
        { error: "Invalid analysis structure" },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = createServerSupabaseClient();

    const { data: savedAnalysis, error: insertError } = await supabase
      .from("analyses")
      .insert([
        {
          user_id: userId,
          image_url: imageUrl,
          timeframe,
          bias: analysis.bias,
          entry: analysis.entry,
          tp: analysis.tp,
          sl: analysis.sl,
          reasoning: analysis.reasoning,
          raw_market_data: marketData,
        },
      ])
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw new Error("Failed to save analysis");
    }

    return NextResponse.json({
      success: true,
      analysis,
      savedId: savedAnalysis?.[0]?.id,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze chart",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
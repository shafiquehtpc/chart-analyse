import { NextRequest, NextResponse } from "next/server";

interface TwelveDataCandle {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export async function POST(request: NextRequest) {
  try {
    const { timeframe } = await request.json();

    if (!timeframe) {
      return NextResponse.json(
        { error: "Timeframe is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const twelveDataUrl = `https://api.twelvedata.com/time_series?symbol=XAUUSD&exchange=FOREX&interval=${timeframe}&outputsize=50&apikey=${apiKey}`;

    const response = await fetch(twelveDataUrl);

    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== "ok") {
      return NextResponse.json(
        { error: "Failed to fetch market data", details: data.message },
        { status: 400 }
      );
    }

    const candles = data.values as TwelveDataCandle[];

    // Format data for Claude
    const formattedData = candles.map((candle) => ({
      datetime: candle.datetime,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume),
    }));

    return NextResponse.json({
      symbol: "XAUUSD",
      timeframe,
      candles: formattedData,
    });
  } catch (error) {
    console.error("Market data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
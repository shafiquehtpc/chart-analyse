"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import ChartUploader from "@/components/ChartUploader";
import TimeframeSelector from "@/components/TimeframeSelector";
import AnalysisResults from "@/components/AnalysisResults";
import { Loader2, AlertCircle, CheckCircle, RotateCcw } from "lucide-react";

interface Analysis {
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  entry: number;
  tp: number;
  sl: number;
  reasoning: string;
}

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleUploadSuccess = (url: string) => {
    setImageUrl(url);
    setError("");
    setSuccess("Chart uploaded successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAnalyze = async () => {
    if (!imageUrl || !timeframe || !user) {
      setError("Please upload a chart and select a timeframe");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError("");
      setAnalysis(null);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          timeframe,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      setSuccess("Analysis completed successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Analysis failed";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageUrl("");
    setTimeframe("");
    setAnalysis(null);
    setError("");
    setSuccess("");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to use the analyzer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            XAUUSD Chart Analyzer
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered trading plan generation
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Alert Messages */}
          {error && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Upload Section */}
          {!analysis && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Upload Chart
              </h2>
              <ChartUploader
                onUploadSuccess={handleUploadSuccess}
                onError={(err) => setError(err)}
              />

              {imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Chart preview"
                    className="max-h-64 rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Timeframe & Analyze Section */}
          {!analysis && imageUrl && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Step 2: Select Timeframe
              </h2>
              <TimeframeSelector
                value={timeframe}
                onChange={setTimeframe}
                disabled={isAnalyzing}
              />
              <button
                onClick={handleAnalyze}
                disabled={!timeframe || isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAnalyzing ? "Analyzing..." : "Analyze Chart"}
              </button>
            </div>
          )}

          {/* Results Section */}
          {analysis && (
            <div className="space-y-4">
              <AnalysisResults analysis={analysis} />
              <button
                onClick={handleReset}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Analyze Another Chart
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
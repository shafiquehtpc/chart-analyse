"use client";

import { ArrowUp, ArrowDown, Target, Shield } from "lucide-react";

interface AnalysisResultsProps {
  analysis: {
    bias: "BULLISH" | "BEARISH" | "NEUTRAL";
    entry: number;
    tp: number;
    sl: number;
    reasoning: string;
  };
}

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const biasColor =
    analysis.bias === "BULLISH"
      ? "text-green-600 bg-green-50"
      : analysis.bias === "BEARISH"
        ? "text-red-600 bg-red-50"
        : "text-gray-600 bg-gray-50";

  const biasIcon =
    analysis.bias === "BULLISH" ? (
      <ArrowUp className="w-5 h-5" />
    ) : analysis.bias === "BEARISH" ? (
      <ArrowDown className="w-5 h-5" />
    ) : null;

  const calculateRiskReward =
    (Math.abs(analysis.tp - analysis.entry) /
      Math.abs(analysis.entry - analysis.sl)) *
    100;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Bias */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg ${biasColor} border border-current border-opacity-20`}
      >
        {biasIcon}
        <span className="font-semibold text-lg">{analysis.bias}</span>
      </div>

      {/* Price Levels Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Entry */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 font-medium mb-1">ENTRY</p>
          <p className="text-2xl font-bold text-blue-600">
            {analysis.entry.toFixed(2)}
          </p>
        </div>

        {/* Take Profit */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-green-600" />
            <p className="text-xs text-gray-600 font-medium">TAKE PROFIT</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {analysis.tp.toFixed(2)}
          </p>
        </div>

        {/* Stop Loss */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-red-600" />
            <p className="text-xs text-gray-600 font-medium">STOP LOSS</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {analysis.sl.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Risk/Reward Ratio */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <p className="text-xs text-gray-600 font-medium mb-1">RISK/REWARD RATIO</p>
        <p className="text-2xl font-bold text-purple-600">
          1:{calculateRiskReward.toFixed(2)}
        </p>
      </div>

      {/* Reasoning */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h4>
        <p className="text-gray-600 leading-relaxed">{analysis.reasoning}</p>
      </div>
    </div>
  );
}
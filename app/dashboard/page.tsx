"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  bias: string;
  created_at: string;
  timeframe: string;
  entry: number;
  tp: number;
  sl: number;
}

interface Analytics {
  totalAnalyses: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  avgRiskReward: number;
  analysesPerTimeframe: Record<string, number>
  analysesPerDay: Array<{ date: string; count: number }>;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch all analyses
      const { data: analyses, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allAnalyses = (analyses || []) as Analysis[];
      const recentCount = 10;
      setRecentAnalyses(allAnalyses.slice(0, recentCount));

      // Calculate analytics
      const totalAnalyses = allAnalyses.length;
      const bullishCount = allAnalyses.filter((a) => a.bias === 'BULLISH').length;
      const bearishCount = allAnalyses.filter((a) => a.bias === 'BEARISH').length;
      const neutralCount = allAnalyses.filter((a) => a.bias === 'NEUTRAL').length;

      // Calculate average risk/reward
      const avgRiskReward =
        allAnalyses.reduce((sum, a) => {
          const riskReward = (Math.abs(a.tp - a.entry) / Math.abs(a.entry - a.sl)) * 100;
          return sum + riskReward;
        }, 0) / Math.max(totalAnalyses, 1);

      // Analyses per timeframe
      const timeframeMap: Record<string, number> = {};
      allAnalyses.forEach((a) => {
        timeframeMap[a.timeframe] = (timeframeMap[a.timeframe] || 0) + 1;
      });

      // Analyses per day (last 7 days)
      const dayMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dayMap[dateStr] = 0;
      }

      allAnalyses.forEach((a) => {
        const dateStr = a.created_at.split('T')[0];
        if (dateStr in dayMap) {
          dayMap[dateStr]++;
        }
      });

      const analysesPerDay = Object.entries(dayMap)
        .map(([date, count]) => ({ date, count }))
        .reverse();

      setAnalytics({
        totalAnalyses,
        bullishCount,
        bearishCount,
        neutralCount,
        avgRiskReward,
        analysesPerTimeframe: timeframeMap,
        analysesPerDay,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your dashboard</p>
          <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Your trading analysis statistics</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Analyses */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Analyses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{analytics.totalAnalyses}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400 opacity-20" />
              </div>
            </div>

            {/* Bullish */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Bullish</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{analytics.bullishCount}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {((analytics.bullishCount / analytics.totalAnalyses) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400 opacity-20" />
              </div>
            </div>

            {/* Bearish */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Bearish</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{analytics.bearishCount}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {((analytics.bearishCount / analytics.totalAnalyses) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500 dark:text-red-400 opacity-20" />
              </div>
            </div>

            {/* Avg Risk/Reward */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg Risk/Reward</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    1:{analytics.avgRiskReward.toFixed(2)}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-500 dark:text-purple-400 opacity-20" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeframe Distribution */}
          {analytics && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeframe Distribution</h3>
              <div className="space-y-3">
                {Object.entries(analytics.analysesPerTimeframe).map(([tf, count]) => (
                  <div key={tf} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{tf}</span>
                    <div className="flex items-center gap-2 flex-1 ml-4">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.totalAnalyses) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Analyses</h3>
            <div className="space-y-2">
              {recentAnalyses.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-sm">No analyses yet</p>
              ) : (
                recentAnalyses.slice(0, 5).map((analysis) => (
                  <div
                    key={analysis.created_at}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{analysis.timeframe}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-medium ${
                        analysis.bias === 'BULLISH'
                          ? 'bg-green-600'
                          : analysis.bias === 'BEARISH'
                            ? 'bg-red-600'
                            : 'bg-gray-600'
                      }`}
                    >
                      {analysis.bias}
                    </span>
                  </div>
                ))
              )}
            </div>
            {recentAnalyses.length > 5 && (
              <Link
                href="/history"
                className="block text-center mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                View all
              </Link>
            )}
          </div>
        </div>

        {/* Daily Activity */}
        {analytics && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity (Last 7 Days)</h3>
            <div className="flex items-end justify-between h-32 gap-1">
              {analytics.analysesPerDay.map((day) => {
                const maxCount = Math.max(...analytics.analysesPerDay.map((d) => d.count), 1);
                const height = (day.count / maxCount) * 100;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-600 dark:bg-blue-400 rounded-t transition hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${day.date}: ${day.count} analyses`}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
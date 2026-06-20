"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Trash2, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Analysis {
  id: string;
  created_at: string;
  timeframe: string;
  bias: string;
  entry: number;
  tp: number;
  sl: number;
  reasoning: string;
}

const ITEMS_PER_PAGE = 10;

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBias, setFilterBias] = useState<string>('');
  const [filterTimeframe, setFilterTimeframe] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  useEffect(() => {
    filterAnalyses();
  }, [analyses, filterBias, filterTimeframe]);

  const fetchAnalyses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAnalyses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analyses');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnalyses = () => {
    let filtered = analyses;

    if (filterBias) {
      filtered = filtered.filter((a) => a.bias === filterBias);
    }

    if (filterTimeframe) {
      filtered = filtered.filter((a) => a.timeframe === filterTimeframe);
    }

    setFilteredAnalyses(filtered);
    setCurrentPage(1);
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('analyses').delete().eq('id', id);

      if (deleteError) throw deleteError;
      setAnalyses(analyses.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete analysis');
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'Timeframe', 'Bias', 'Entry', 'TP', 'SL', 'Reasoning'].join(','),
      ...filteredAnalyses.map((a) =>
        [
          new Date(a.created_at).toLocaleString(),
          a.timeframe,
          a.bias,
          a.entry,
          a.tp,
          a.sl,
          `"${a.reasoning}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analyses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(filteredAnalyses.length / ITEMS_PER_PAGE);
  const paginatedAnalyses = filteredAnalyses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (userLoading) {
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your analysis history</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your chart analyses</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Bias
              </label>
              <select
                value={filterBias}
                onChange={(e) => setFilterBias(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Biases</option>
                <option value="BULLISH">Bullish</option>
                <option value="BEARISH">Bearish</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Timeframe
              </label>
              <select
                value={filterTimeframe}
                onChange={(e) => setFilterTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Timeframes</option>
                <option value="1min">1 Minute</option>
                <option value="5min">5 Minutes</option>
                <option value="15min">15 Minutes</option>
                <option value="30min">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1day">Daily</option>
              </select>
            </div>

            <button
              onClick={exportToCSV}
              disabled={filteredAnalyses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin" />
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No analyses found</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Bias</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Entry</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">TP</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">SL</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedAnalyses.map((analysis) => (
                      <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                          {new Date(analysis.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{analysis.timeframe}</td>
                        <td className="px-6 py-4 text-sm">
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
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{analysis.entry.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{analysis.tp.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{analysis.sl.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            title="Delete analysis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAnalyses.length)} of {filteredAnalyses.length}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
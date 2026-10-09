'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NexusHome() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSearchTrigger = async () => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    setIsSubmitting(true);

    try {
      // Asynchronous background fire-and-forget telemetry ingestion loop
      // Fired without blocking client redirect execution speeds
      fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: cleanQuery }),
      }).catch((e) => console.warn('Telemetry payload buffer delayed:', e));

      // Check if it is a structural direct-routing domain request shortcut
      if (cleanQuery.endsWith('.eth') || cleanQuery.endsWith('.sol') || cleanQuery.endsWith('.crypto')) {
        router.push(`/view/${encodeURIComponent(cleanQuery)}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
      }
    } catch (error) {
      console.error('Execution router collision detected:', error);
      router.push(`/search?q=${encodeURIComponent(cleanQuery)}`);
    }
  };

  return (
    <div class="bg-[#080B12] text-gray-400 min-h-screen flex flex-col justify-between overflow-hidden relative antialiased select-none selection:bg-cyan-500/30 selection:text-white">
      {/* Visual Tech UI Background Glow Systems */}
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <header class="h-16 flex items-center justify-end px-6 z-10"></header>

      <main class="flex flex-col items-center justify-center flex-grow px-4 -mt-16 z-10 w-full max-w-4xl mx-auto">
        {/* Modern Vector Typography Branding Element */}
        <div class="flex items-center space-x-3.5 mb-9">
          <div class="bg-gradient-to-tr from-cyan-400 to-purple-600 p-3 rounded-2xl shadow-xl shadow-cyan-500/10">
            <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h1 class="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            NexusSearch
          </h1>
        </div>

        {/* Input Navigation Engine Component */}
        <div class="w-full max-w-xl relative group px-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
            disabled={isSubmitting}
            placeholder="Search decentralized web keywords or protocols (.eth, .sol)..."
            class="w-full pl-6 pr-12 py-4 bg-[#121824]/90 border border-gray-800 rounded-2xl text-white placeholder-gray-500 font-medium shadow-2xl focus:outline-none focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/5 transition duration-200 text-base disabled:opacity-50"
          />
          <div class="absolute inset-y-0 right-4 flex items-center cursor-pointer text-gray-500 hover:text-cyan-400 transition" onClick={handleSearchTrigger}>
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
        </div>

        {/* Google UX Core Function Buttons */}
        <div class="flex space-x-4 mt-9">
          <button
            onClick={handleSearchTrigger}
            disabled={isSubmitting}
            class="bg-[#121824] hover:bg-[#182030] active:scale-95 text-sm font-semibold text-gray-300 hover:text-white px-6 py-3 rounded-xl border border-gray-800/80 hover:border-gray-700 transition duration-150 shadow-md disabled:opacity-50"
          >
            Network Search
          </button>
          <button
            onClick={() => alert('Zero-fee structural indexing registry functions deploy in the next patch sequence.')}
            class="bg-gradient-to-r from-cyan-500/5 to-purple-500/5 hover:from-cyan-500/10 hover:to-purple-500/10 active:scale-95 text-sm font-semibold text-cyan-400 px-6 py-3 rounded-xl border border-cyan-500/10 hover:border-cyan-500/20 transition duration-150 shadow-sm"
          >
            + Index Domain
          </button>
        </div>
      </main>

      <footer class="bg-[#05070c]/60 border-t border-gray-900/50 backdrop-blur-md z-10 text-xs text-gray-500 font-medium">
        <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-y-2">
          <div class="flex space-x-6">
            <a href="#" class="hover:text-gray-300 transition">Infrastructure Specs</a>
            <a href="#" class="hover:text-gray-300 transition">Privacy Ledger Policy</a>
          </div>
          <div>
            <span class="text-gray-600">Network Engine Status: <span class="text-emerald-400 font-bold">Edge Matrix Online</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

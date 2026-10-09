'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

interface AdPayload {
  id: string;
  proxyUrl: string;
  headline: string;
  description: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [ads, setAds] = useState<AdPayload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    
    setLoading(true);
    // Concurrent non-blocking async network auction dispatch logic
    fetch(`/api/ads?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.matches) {
          setAds(data.matches);
        }
      })
      .catch((err) => console.error('Contextual ad streaming fault:', err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div class="bg-[#080B12] text-gray-300 min-h-screen flex flex-col justify-between antialiased selection:bg-cyan-500/30 selection:text-white">
      {/* Structural Search Header Layout Element */}
      <header class="border-b border-gray-900/60 bg-[#080B12]/80 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center space-x-6 z-50">
        <Link href="/" class="flex items-center space-x-2 shrink-0 cursor-pointer group">
          <div class="bg-gradient-to-tr from-cyan-400 to-purple-600 p-1.5 rounded-lg group-hover:scale-105 transition duration-150">
            <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <span class="text-lg font-black text-white tracking-tight hidden sm:inline-block">NexusSearch</span>
        </Link>
        
        <div class="w-full max-w-xl relative">
          <input
            type="text"
            defaultValue={query}
            readOnly
            class="w-full pl-4 pr-10 py-2.5 bg-[#121824] border border-gray-800 rounded-xl text-white text-sm font-medium focus:outline-none opacity-80 cursor-not-allowed"
          />
        </div>
      </header>

      {/* Main Stream Presentation Container */}
      <main class="max-w-3xl w-full mx-auto px-6 py-8 flex-grow">
        <p class="text-xs text-gray-500 mb-6 font-medium">
          Search network records scan initialized query context for: "{query}"
        </p>

        {loading ? (
          <div class="flex items-center space-x-3 text-sm text-gray-500 font-medium py-12">
            <div class="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Parsing decentralized network nodes...</span>
          </div>
        ) : (
          <div class="space-y-7">
            {/* ==================== INLINE CONTEXTUAL SPONSORED TEXT ADS ==================== */}
            {ads.map((ad) => (
              <div key={ad.id} class="p-4 rounded-xl bg-cyan-500/[0.01] border border-cyan-500/10 hover:border-cyan-500/20 hover:bg-cyan-500/[0.02] transition duration-150 group cursor-pointer">
                <div class="flex items-center space-x-2 text-xs text-cyan-400 mb-1.5 font-bold tracking-wide">
                  <span class="bg-cyan-500/10 px-1.5 py-0.5 rounded text-[9px] border border-cyan-500/20 uppercase">Sponsored</span>
                  <span>{ad.proxyUrl}</span>
                </div>
                <h2 class="text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-150">
                  {ad.headline}
                </h2>
                <p class="text-sm text-gray-400 mt-1 leading-relaxed font-medium">
                  {ad.description}
                </p>
              </div>
            ))}

            {/* ==================== CORE DECENTRALIZED RESULTS CONTAINER ==================== */}
            <div class="p-4 rounded-xl border border-gray-900 bg-[#121824]/20 hover:border-purple-500/20 transition duration-150 group">
              <div class="text-xs text-purple-400 mb-1.5 font-semibold tracking-wide">
                <span>network-index://resolved.node.hash</span>
              </div>
              <h2 class="text-base font-bold text-white group-hover:text-purple-400 transition-colors duration-150">
                Fallback Query Resolution Array
              </h2>
              <p class="text-sm text-gray-400 mt-1 leading-relaxed font-medium">
                No strict directory domain bound directly matches this token array. To access cross-protocol platforms, append ".eth", ".sol" or ".crypto" file extensions to verify structural locations on the network mapping.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer class="bg-[#05070c] border-t border-gray-900 text-[10px] text-gray-600 font-bold py-4 px-6 flex justify-between">
        <span>NEXUS DATA FABRIC ANALYTICS</span>
        <a href="#" class="hover:text-gray-400 transition uppercase tracking-wider">Zero-Data Tracking Opt Out</a>
      </footer>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div class="bg-[#080B12] min-h-screen flex items-center justify-center text-gray-500 text-sm font-medium">
        Loading system stream matrices...
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

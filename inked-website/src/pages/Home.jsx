import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Calendar, Clock, ArrowRight, TrendingUp, Sparkles, 
  Flame, Filter, Newspaper, ChevronLeft, ChevronRight
} from 'lucide-react';
import Masthead from '../components/Masthead';
import Footer from '../components/Footer';
import { mainApiClient } from '../lib/axios';

const CATEGORY_STYLES = {
  'TechCrunch': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', tag: 'TECHNOLOGY' },
  'Hacker News': { bg: 'bg-orange-50 text-orange-700 border-orange-200', tag: 'TECH & CODE' },
  'SpaceNews': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', tag: 'SPACE' },
  'NASA': { bg: 'bg-blue-50 text-blue-700 border-blue-200', tag: 'ASTRONOMY' },
  'The Hindu': { bg: 'bg-rose-50 text-rose-700 border-rose-200', tag: 'NATIONAL' },
  'The Guardian': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', tag: 'WORLD' },
  'Reuters': { bg: 'bg-amber-50 text-amber-700 border-amber-200', tag: 'BUSINESS' },
  'DEFAULT': { bg: 'bg-gray-50 text-gray-700 border-gray-200', tag: 'GENERAL' }
};

// Smart Fisher-Yates shuffle that prioritizes a hero with a valid image
const shuffleArticles = (arr) => {
  if (!arr || arr.length === 0) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  // Ensure the lead story has an image if present in the batch
  const imgIdx = copy.findIndex(a => a.image_link && /^https?:\/\//.test(a.image_link));
  if (imgIdx > 0) {
    const [hero] = copy.splice(imgIdx, 1);
    copy.unshift(hero);
  }
  return copy;
};

export default function Home({ theme, toggleTheme }) {
  const [articles, setArticles] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [_page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get('q') || '';

  // Auto-sliding Hero Carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const bottomSentinelRef = useRef(null);

  const fetchFeed = useCallback(async (pageNum, append = false) => {
    if (!append) setIsLoadingFeed(true);
    else setIsLoadingMore(true);
    
    setFeedError(null);
    try {
      const limit = searchFilter ? 80 : 30;
      const res = await mainApiClient.get(`/api/feed?limit=${limit}&page=${pageNum}`);
      const data = res.data;
      if (data.success) {
        if (data.data.length < limit) setHasMore(false);
        if (append) {
          setArticles(prev => [...prev, ...(searchFilter ? data.data : shuffleArticles(data.data))]);
        } else {
          setArticles(searchFilter ? data.data : shuffleArticles(data.data));
        }
      } else {
        throw new Error(data.error || 'Failed to retrieve articles');
      }
    } catch (err) {
      setFeedError(err.message || 'Unable to connect to backend feed');
    } finally {
      setIsLoadingFeed(false);
      setIsLoadingMore(false);
    }
  }, [searchFilter]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false);
  }, [searchFilter, fetchFeed]);

  // Infinite Scroll Auto-Loader via IntersectionObserver
  useEffect(() => {
    if (isLoadingFeed || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingFeed) {
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchFeed(nextPage, true);
            return nextPage;
          });
        }
      },
      { rootMargin: '350px' }
    );

    const target = bottomSentinelRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [isLoadingFeed, isLoadingMore, hasMore, fetchFeed]);

  // Filter if search query exists
  const displayedArticles = searchFilter
    ? articles.filter(a => 
        (a.headline && a.headline.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (a.description && a.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (a.source && a.source.toLowerCase().includes(searchFilter.toLowerCase()))
      )
    : articles;

  // Breakdown for rich editorial layouts
  const imageHeroCandidates = displayedArticles.filter(a => a.image_link && /^https?:\/\//.test(a.image_link)).slice(0, 5);
  const activeHeroList = imageHeroCandidates.length >= 2 ? imageHeroCandidates : displayedArticles.slice(0, 5);
  const currentHero = activeHeroList[heroIndex] || activeHeroList[0] || displayedArticles[0];

  const editorPicks = displayedArticles.slice(1, 3);
  const trendingNow = displayedArticles.slice(3, 7);
  const spotlightStories = displayedArticles.slice(7, 11);
  const streamArticles = displayedArticles.slice(11);

  // Reset carousel slide on dataset change
  useEffect(() => {
    setHeroIndex(0);
  }, [articles, searchFilter]);

  // Auto-slide carousel timer (5.5s interval with hover pause)
  useEffect(() => {
    if (isHeroHovered || activeHeroList.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % activeHeroList.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHeroHovered, activeHeroList.length]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111113] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      {/* ── Search Filter Banner (If search active) ── */}
      {searchFilter && (
        <div className="bg-red-50 border-b border-red-200 py-3 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-800 font-normal">
              <Filter size={16} />
              <span>Showing search results for: <strong className="font-semibold">"{searchFilter}"</strong></span>
              <span className="text-xs bg-red-200 px-2 py-0.5 rounded-full text-red-900 font-medium ml-2">
                {displayedArticles.length} found
              </span>
            </div>
            <Link to="/" className="text-xs text-red-700 hover:text-red-900 font-medium underline">
              Clear Filter
            </Link>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full font-sans">
        
        {feedError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm shadow-sm font-normal">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
            <span><strong className="font-medium">Notice:</strong> {feedError}. Please ensure backend services are active.</span>
          </div>
        )}

        {isLoadingFeed ? (
          /* Skeleton Grid */
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-44 bg-gray-200 rounded-2xl"></div>
                <div className="h-44 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="lg:col-span-6">
                <div className="h-[480px] bg-gray-200 rounded-3xl"></div>
              </div>
              <div className="lg:col-span-3 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 shadow-sm p-8 max-w-xl mx-auto font-sans">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="font-serif font-medium text-2xl text-gray-900 mb-2">No Stories Available</h3>
            <p className="text-gray-500 text-sm font-normal mb-6 leading-relaxed">
              We couldn't locate any stories matching your criteria. Please refresh or check back in a few moments.
            </p>
            <button 
              onClick={() => fetchFeed(1, false)} 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-medium hover:bg-red-600 transition-colors cursor-pointer"
            >
              Refresh Stories →
            </button>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16 font-sans">
            
            {/* ═════════════════════════════════════════════════════════════════
                SECTION 1: EDITORIAL 3-COLUMN BENTO
               ═════════════════════════════════════════════════════════════════ */}
            <section>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* ── LEFT COLUMN: Editor's Picks (3 cols) ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                    <h2 className="font-semibold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5 font-sans">
                      <Flame size={14} className="text-red-600" />
                      Editor's Picks
                    </h2>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Curated</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {editorPicks.map((art, idx) => {
                      const style = CATEGORY_STYLES[art.source] || CATEGORY_STYLES['DEFAULT'];
                      return (
                        <Link 
                          key={idx} 
                          to={`/article/${encodeURIComponent(art.headline)}`} 
                          state={{ article: art }}
                          className="group bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-2.5 no-underline"
                        >
                          <div className="flex items-center justify-between font-sans">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg}`}>
                              {art.source || style.tag}
                            </span>
                            <span className="text-[11px] text-gray-400 font-normal">
                              {art.time || 'Today'}
                            </span>
                          </div>
                          
                          {art.image_link && (
                            <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 relative">
                              <img 
                                src={art.image_link} 
                                alt={art.headline} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            </div>
                          )}

                          {/* Article Title: Noto Serif 500 */}
                          <h3 className="font-serif font-medium text-base text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                            {art.headline}
                          </h3>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* ── CENTER COLUMN: Auto-Sliding Lead Story Hero (6 cols) ── */}
                <div 
                  className="lg:col-span-6 relative h-full group"
                  onMouseEnter={() => setIsHeroHovered(true)}
                  onMouseLeave={() => setIsHeroHovered(false)}
                >
                  {currentHero && (
                    <div className="relative block rounded-3xl overflow-hidden bg-neutral-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-full min-h-[520px] flex flex-col justify-end">
                      {/* Background Hero Image */}
                      {currentHero.image_link && (
                        <img 
                          key={currentHero.headline}
                          src={currentHero.image_link} 
                          alt={currentHero.headline} 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      
                      {/* Gradient scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none"></div>

                      {/* Top Carousel Navigation Bar */}
                      {activeHeroList.length > 1 && (
                        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                          {/* Dot Indicators */}
                          <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            {activeHeroList.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setHeroIndex(idx);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                  heroIndex === idx ? 'w-6 bg-red-600' : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                                title={`Go to story ${idx + 1}`}
                              />
                            ))}
                          </div>

                          {/* Arrow Controls (visible on hover) */}
                          <div className="flex items-center gap-1 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setHeroIndex(prev => (prev - 1 + activeHeroList.length) % activeHeroList.length);
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
                              title="Previous Story"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setHeroIndex(prev => (prev + 1) % activeHeroList.length);
                              }}
                              className="p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/15 transition-colors cursor-pointer"
                              title="Next Story"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Content Overlay Link */}
                      <Link
                        to={`/article/${encodeURIComponent(currentHero.headline)}`} 
                        state={{ article: currentHero }}
                        className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col justify-end gap-4 no-underline text-white"
                      >
                        <div className="flex flex-wrap items-center gap-2.5 font-sans">
                          <span className="bg-red-600 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                            Lead Story {activeHeroList.length > 1 ? `(${heroIndex + 1}/${activeHeroList.length})` : ''}
                          </span>
                          <span className="text-xs text-gray-300 font-medium bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            {currentHero.source || 'GLOBAL NEWS'}
                          </span>
                          <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                            <Clock size={12} /> {currentHero.date || 'Today'}
                          </span>
                        </div>

                        {/* Main Headline: Noto Serif 500 */}
                        <h1 className="font-serif font-medium text-2xl sm:text-3xl lg:text-4xl leading-tight text-white group-hover:text-red-400 transition-colors">
                          {currentHero.headline}
                        </h1>

                        {/* Article body summary: Inter 400 */}
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-3 font-normal max-w-2xl font-sans">
                          {currentHero.summary || currentHero.description || 'Access comprehensive independent journalism detailing latest worldwide occurrences.'}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-xs text-gray-300 border-t border-white/15 mt-2 font-sans font-normal">
                          <span className="flex items-center gap-1.5 text-red-400 font-medium uppercase tracking-wider">
                            <Sparkles size={14} /> Fact-Checked & Verified
                          </span>
                          <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-white font-medium">
                            Read Full Story <ArrowRight size={14} />
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* ── RIGHT COLUMN: Trending Fast (3 cols) ── */}
                <div className="lg:col-span-3 flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                    <h2 className="font-semibold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5 font-sans">
                      <TrendingUp size={14} className="text-red-600" />
                      Trending Fast
                    </h2>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Live Ranking</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col divide-y divide-gray-100 font-sans">
                    {trendingNow.map((art, idx) => (
                      <Link 
                        key={idx} 
                        to={`/article/${encodeURIComponent(art.headline)}`} 
                        state={{ article: art }}
                        className="group py-3.5 first:pt-1 last:pb-1 flex items-start gap-3.5 no-underline"
                      >
                        <span className="font-serif font-medium text-2xl text-gray-300 group-hover:text-red-600 transition-colors leading-none shrink-0 w-6">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-semibold text-red-600 uppercase tracking-wider">
                              {art.source || 'Top'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {art.time || '10m ago'}
                            </span>
                          </div>
                          {/* Headline: Noto Serif 500 */}
                          <h4 className="font-serif font-medium text-xs sm:text-sm text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                            {art.headline}
                          </h4>
                        </div>

                        {art.image_link && (
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img 
                              src={art.image_link} 
                              alt={art.headline} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </section>


            {/* ═════════════════════════════════════════════════════════════════
                SECTION 2: SPOTLIGHT REEL
               ═════════════════════════════════════════════════════════════════ */}
            {spotlightStories.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs font-sans">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <h2 className="font-serif font-medium text-xl sm:text-2xl text-neutral-900">
                      Editor's Choice Highlights
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400 font-normal hidden sm:inline">
                    Deep dive perspectives from top correspondents
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {spotlightStories.map((art, idx) => (
                    <Link
                      key={idx}
                      to={`/article/${encodeURIComponent(art.headline)}`}
                      state={{ article: art }}
                      className="group flex flex-col bg-gray-50/70 p-4 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all no-underline"
                    >
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-gray-200 mb-3.5 relative">
                        {art.image_link ? (
                          <img 
                            src={art.image_link} 
                            alt={art.headline} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-serif font-medium text-xs">
                            NEWSONTIP
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {art.source || 'Perspective'}
                        </span>
                      </div>

                      {/* Headline: Noto Serif 500 */}
                      <h3 className="font-serif font-medium text-sm text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                        {art.headline}
                      </h3>

                      {/* Excerpt: Inter 400 */}
                      <p className="text-xs text-gray-500 font-normal line-clamp-2 leading-relaxed mb-4 font-sans">
                        {art.summary || art.description || 'Click to view complete story breakdown.'}
                      </p>

                      <div className="mt-auto pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] font-normal text-gray-400 font-sans">
                        <span>{art.date || 'Recent'}</span>
                        <span className="text-neutral-900 font-medium group-hover:text-red-600 flex items-center gap-0.5">
                          Read <ArrowRight size={12} />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}


            {/* ═════════════════════════════════════════════════════════════════
                SECTION 3: LATEST ARCHIVES STREAM
               ═════════════════════════════════════════════════════════════════ */}
            <section className="font-sans">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-red-600">
                      Archive Stream
                    </span>
                  </div>
                  <h2 className="font-serif font-medium text-2xl sm:text-3xl text-neutral-900">
                    Latest Dispatches & Reports
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 font-sans">
                  {['All', 'Technology', 'World', 'Business'].map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:text-neutral-900 cursor-pointer">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3-Column Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {streamArticles.map((art, idx) => {
                  const style = CATEGORY_STYLES[art.source] || CATEGORY_STYLES['DEFAULT'];
                  return (
                    <article 
                      key={idx}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
                    >
                      {/* Card Thumbnail */}
                      <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="relative block h-56 overflow-hidden bg-gray-100 no-underline">
                        {art.image_link ? (
                          <img 
                            src={art.image_link} 
                            alt={art.headline} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-serif font-medium">
                            NEWSONTIP NEWS ARCHIVE
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-xs backdrop-blur-sm ${style.bg}`}>
                            {art.source || 'NEWS'}
                          </span>
                        </div>
                      </Link>

                      {/* Card Body */}
                      <div className="p-6 sm:p-7 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-normal mb-3 font-sans">
                          <Calendar size={13} className="text-red-600" />
                          <span>{art.date || 'Today'}</span>
                          <span>•</span>
                          <span>{art.time || '2 min read'}</span>
                        </div>

                        {/* Title: Noto Serif 500 */}
                        <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="no-underline">
                          <h3 className="font-serif font-medium text-lg sm:text-xl text-neutral-900 leading-snug mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                            {art.headline}
                          </h3>
                        </Link>

                        {/* Article body/summary: Inter 400 */}
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3 font-normal font-sans">
                          {art.summary || art.description || 'Complete story report available. Click through to read full context and analysis.'}
                        </p>

                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-sans">
                          <span className="text-[11px] font-normal text-gray-500 uppercase tracking-wide">
                            Source: {art.source}
                          </span>
                          <Link 
                            to={`/article/${encodeURIComponent(art.headline)}`} 
                            state={{ article: art }} 
                            className="inline-flex items-center gap-1 font-medium text-neutral-900 group-hover:text-red-600 transition-colors no-underline"
                          >
                            Read Full <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Skeleton Cards on Auto-Loading More Articles */}
              {isLoadingMore && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-2xs flex flex-col h-[420px]">
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-6 flex flex-col flex-1 gap-3.5">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3.5 bg-gray-200 rounded w-full"></div>
                        <div className="h-3.5 bg-gray-200 rounded w-4/5"></div>
                        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Sentinel Target for Auto Intersection Observer */}
              {hasMore && (
                <div ref={bottomSentinelRef} className="h-8 w-full mt-4 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
                </div>
              )}

              {/* End of Feed Message when all caught up */}
              {!hasMore && displayedArticles.length > 0 && (
                <div className="text-center py-12 border-t border-gray-200 mt-12 font-sans">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <Sparkles size={13} className="text-red-600" /> You're all caught up • NewsOnTip Global Wire
                  </span>
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Menu, X, Search, Sparkles, ChevronRight, TrendingUp, Newspaper, ArrowRight } from "lucide-react";
import { mainApiClient } from "../lib/axios";

const CATEGORIES = [
  { id: "all", label: "All Stories", path: "/" },
  { id: "world", label: "World", path: "/category/world" },
  { id: "technology", label: "Technology", path: "/category/technology" },
  { id: "business", label: "Business", path: "/category/business" },
  { id: "space", label: "Space", path: "/category/space" },
  { id: "sports", label: "Sports", path: "/category/sports" },
  { id: "entertainment", label: "Entertainment", path: "/category/entertainment" },
  { id: "health", label: "Health", path: "/category/health" },
  { id: "lifestyle", label: "Lifestyle", path: "/category/lifestyle" },
];

const TRENDING_TOPICS = [
  "Artificial Intelligence", "Tech", "SpaceX", "Markets", "Economy", "Climate", "Science"
];

export default function Masthead({ theme: _theme, toggleTheme: _toggleTheme }) {
  const [scrollState, setScrollState] = useState('at-top'); // 'at-top' | 'scrolling-down' | 'scrolling-up'
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [cachedArticles, setCachedArticles] = useState([]);
  const searchContainerRef = useRef(null);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const TICKER_HEADLINES = [
    "Global news wires reporting in real time across world, tech, and markets",
    "Markets react as tech leaders announce unified open-source standards",
    "Spacecraft completes historic lunar orbit mission with HD transmissions",
    "Renewable energy investments hit record global peak in 2026",
  ];

  // Sync input value whenever URL search param changes (only if not currently focused to avoid typing collision)
  useEffect(() => {
    if (!isFocused) {
      setSearchQuery(urlQuery);
    }
  }, [urlQuery, isFocused]);

  // Fetch articles once for fast live suggestions
  useEffect(() => {
    let isMounted = true;
    const loadSuggestionFeed = async () => {
      try {
        const res = await mainApiClient.get('/api/feed?limit=60');
        if (res.data?.success && isMounted) {
          setCachedArticles(res.data.data || []);
        }
      } catch (_err) {
        // Silently handle suggestion feed error
      }
    };
    loadSuggestionFeed();
    return () => { isMounted = false; };
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Throttled scroll listener
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;

          if (currentY <= 60) {
            setScrollState('at-top');
          } else if (delta > 6) {
            // Scrolling down -> compact bar
            setScrollState('scrolling-down');
          } else if (delta < -6) {
            // Scrolling up -> full navbar
            setScrollState('scrolling-up');
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setIsFocused(false);
  }, [pathname, urlQuery]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_HEADLINES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [TICKER_HEADLINES.length]);

  const handleInputChange = (val) => {
    setSearchQuery(val);
    const trimmed = val.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSearchSubmit = (e, explicitQuery = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryToUse = (explicitQuery !== null ? explicitQuery : searchQuery).trim();
    setIsFocused(false);

    if (queryToUse) {
      navigate(`/?q=${encodeURIComponent(queryToUse)}`);
    } else {
      // Blank search returns to default Home screen feed
      navigate('/');
    }
  };

  const handleClearSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchQuery('');
    setIsFocused(false);
    navigate('/', { replace: true });
  };

  // Filtered live suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return cachedArticles
      .filter((a) => (
        (a.headline && a.headline.toLowerCase().includes(q)) ||
        (a.source && a.source.toLowerCase().includes(q)) ||
        (a.description && a.description.toLowerCase().includes(q))
      ))
      .slice(0, 5);
  }, [searchQuery, cachedArticles]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Reusable Suggestions Popover Menu
  const renderSuggestionsDropdown = () => {
    if (!isFocused) return null;

    return (
      <div 
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden z-60 text-left animate-in fade-in zoom-in-95 duration-150 font-sans"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {searchQuery.trim() ? (
          <div>
            {suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                  <span>Matching Stories ({suggestions.length})</span>
                  <span className="text-[10px] text-red-600 font-normal">Press Enter to view all</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsFocused(false);
                      navigate(`/article/${encodeURIComponent(item.headline)}`, { state: { article: item } });
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0 cursor-pointer"
                  >
                    {item.image_link && /^https?:\/\//.test(item.image_link) ? (
                      <img
                        src={item.image_link}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Newspaper size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-900 font-medium group-hover:text-red-600 transition-colors line-clamp-1">
                        {item.headline}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-600">{item.source || 'WIRE'}</span>
                        <span>•</span>
                        <span>{item.date || 'Today'}</span>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}

                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearchSubmit(e);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-700 text-gray-600 text-xs font-medium text-center transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search size={12} />
                  <span>See all results for "{searchQuery}"</span>
                </button>
              </div>
            ) : (
              <div className="p-5 text-center">
                <p className="text-xs text-gray-500 font-normal">No articles found matching "{searchQuery}"</p>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClearSearch(e);
                  }}
                  className="mt-2 text-xs text-red-600 font-medium hover:underline cursor-pointer"
                >
                  Clear search & show all stories
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
              <TrendingUp size={12} className="text-red-600" />
              <span>Trending Topics</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TRENDING_TOPICS.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleInputChange(topic);
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-gray-200 rounded-full text-xs text-gray-700 font-normal transition-all cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={searchContainerRef}>
      {/* ═════════════════════════════════════════════════════════════════
          1. FLOATING COMPACT NAVBAR (On Scroll Down)
         ═════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 ease-out transform font-sans ${
          scrollState === 'scrolling-down'
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Logo & Global Edition */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
              aria-label="Open Navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="inline-flex items-center gap-1 group no-underline">
              <span className="font-sans font-semibold text-2xl tracking-tight text-neutral-900 group-hover:text-red-700 transition-colors">
                inked<span className="text-red-600">.</span>
              </span>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-red-600 pl-3 border-l border-gray-200">
              <Sparkles size={11} /> Global Edition
            </span>
          </div>

          {/* Center: Search Bar with Suggestions */}
          <div className="flex-1 max-w-md mx-auto relative">
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative flex items-center w-full"
            >
              <Search size={14} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search headlines, stories, or topics..."
                className="w-full pl-9 pr-20 py-1.5 bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-red-600 rounded-full text-xs text-neutral-900 placeholder-gray-400 focus:ring-2 focus:ring-red-100 outline-none transition-all font-sans font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-14 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[11px] font-medium transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
            {scrollState === 'scrolling-down' && renderSuggestionsDropdown()}
          </div>

          {/* Right: Subscribe Free */}
          <div className="flex items-center justify-end shrink-0">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow no-underline"
            >
              Subscribe Free
            </Link>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          2. FLOATING FULL NAVBAR (Smooth Slide-In on Reverse Scroll Up)
         ═════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-200 shadow-lg transition-all duration-300 ease-out transform font-sans ${
          scrollState === 'scrolling-up'
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-4">
            {/* Left */}
            <div className="flex items-center justify-start gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Open Navigation"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-red-600 flex items-center gap-1">
                  <Sparkles size={11} /> Global Edition
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  Verified Wire Service
                </span>
              </div>
            </div>

            {/* Center: Brand */}
            <div className="flex flex-col items-center justify-center text-center">
              <Link to="/" className="inline-flex items-center gap-1 group no-underline">
                <span className="font-sans font-semibold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-900 group-hover:text-red-700 transition-colors leading-none">
                  inked<span className="text-red-600">.</span>
                </span>
              </Link>
              <p className="hidden md:block text-[9px] uppercase tracking-[0.25em] text-gray-500 font-medium mt-1 leading-none text-center">
                Independent Journalism & Global Dispatches
              </p>
            </div>

            {/* Right: CTA */}
            <div className="flex items-center justify-end gap-2.5">
              <Link
                to="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow no-underline shrink-0"
              >
                Subscribe Free
              </Link>
            </div>
          </div>

          {/* Centered Search Bar with Suggestions */}
          <div className="mt-2.5 max-w-lg mx-auto relative">
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative flex items-center w-full"
            >
              <Search size={15} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search headlines, stories, or topics..."
                className="w-full pl-10 pr-24 py-1.5 bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 focus:border-red-600 rounded-full text-xs sm:text-sm text-neutral-900 placeholder-gray-400 focus:ring-2 focus:ring-red-100 outline-none transition-all font-sans font-normal shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-18 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-3.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
            {scrollState === 'scrolling-up' && renderSuggestionsDropdown()}
          </div>
        </div>

        {/* Categories strip */}
        <div className="border-t border-gray-200 bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center justify-center gap-1.5 py-1.5 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = cat.id === "all" ? pathname === "/" : pathname === cat.path;
                return (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    className={`px-3 py-1 rounded-full text-xs tracking-wide transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "bg-neutral-900 text-white font-semibold shadow-sm"
                        : "text-gray-600 hover:text-red-600 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          3. FULL PRIMARY MASTHEAD (Natural document flow at top)
         ═════════════════════════════════════════════════════════════════ */}
      <header className="w-full bg-white border-b border-gray-200 shadow-2xs font-sans">
        {/* ── Top Bar / Live Ticker ── */}
        <div className="bg-[#111113] text-gray-300 text-xs border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
            {/* Left: Live Ticker */}
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/90 text-white font-medium text-[10px] tracking-wider uppercase shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                Live Feed
              </span>
              <div className="text-gray-300 truncate font-normal transition-all duration-300">
                {TICKER_HEADLINES[tickerIndex]}
              </div>
            </div>

            {/* Right: Date & Secondary Links */}
            <div className="hidden md:flex items-center gap-5 shrink-0 text-gray-400 font-normal">
              <span className="text-gray-400">{currentDate}</span>
              <span className="text-neutral-700">|</span>
              <Link
                to="/how-it-works"
                className="hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link to="/writers" className="hover:text-white transition-colors">
                For Writers
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Editorial Masthead Branding ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-3 items-center gap-4">
            {/* Left: Mobile Toggle & Edition Info */}
            <div className="flex items-center justify-start gap-3">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Open Navigation"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-red-600 flex items-center gap-1">
                  <Sparkles size={11} /> Global Edition
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  Verified Wire Service
                </span>
              </div>
            </div>

            {/* Center: Authoritative Logo - Inter Semibold */}
            <div className="flex flex-col items-center justify-center text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1 group no-underline"
              >
                <span className="font-sans font-semibold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-neutral-900 group-hover:text-red-700 transition-colors leading-none">
                  inked<span className="text-red-600">.</span>
                </span>
              </Link>
              <p className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-gray-500 font-medium mt-1.5 leading-none text-center">
                Independent Journalism & Global Dispatches
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-2.5 sm:gap-3">
              <Link
                to="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow no-underline shrink-0"
              >
                Subscribe Free
              </Link>
            </div>
          </div>

          {/* Permanent Centered Search Bar with Suggestions */}
          <div className="mt-4 max-w-lg mx-auto relative">
            <form
              onSubmit={(e) => handleSearchSubmit(e)}
              className="relative flex items-center w-full"
            >
              <Search size={15} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search headlines, stories, or topics (e.g. Technology, Space, Markets)..."
                className="w-full pl-10 pr-24 py-2 bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 focus:border-red-600 rounded-full text-xs sm:text-sm text-neutral-900 placeholder-gray-400 focus:ring-2 focus:ring-red-100 outline-none transition-all font-sans font-normal shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-20 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-medium transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
            {scrollState === 'at-top' && renderSuggestionsDropdown()}
          </div>
        </div>

        {/* ── Category Navigation Bar (Inter 500-600) ── */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden lg:flex items-center justify-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive =
                  cat.id === "all" ? pathname === "/" : pathname === cat.path;

                return (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    className={`px-3.5 py-1.5 rounded-full text-xs tracking-wide transition-all duration-150 whitespace-nowrap ${
                      isActive
                        ? "bg-neutral-900 text-white font-semibold shadow-sm"
                        : "text-gray-600 hover:text-red-600 hover:bg-gray-100 font-medium"
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ── */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-5 shadow-2xl max-h-[80vh] overflow-y-auto font-sans">
          <div className="mb-4">
            <form onSubmit={(e) => handleSearchSubmit(e)} className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search stories..."
                className="w-full pl-9 pr-10 py-2 bg-gray-100 rounded-xl text-sm font-normal border-0 focus:ring-2 focus:ring-red-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-1 mb-6">
            {CATEGORIES.map((cat) => {
              const isActive =
                cat.id === "all" ? pathname === "/" : pathname === cat.path;
              return (
                <Link
                  key={cat.id}
                  to={cat.path}
                  className={`px-3 py-2.5 rounded-lg text-xs flex items-center justify-between ${
                    isActive
                      ? "bg-red-50 text-red-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            <div className="flex justify-around text-xs text-gray-500 pt-1 font-normal">
              <Link to="/how-it-works" className="hover:text-red-600 transition-colors">How It Works</Link>
              <span>•</span>
              <Link to="/writers" className="hover:text-red-600 transition-colors">For Writers</Link>
              <span>•</span>
              <Link to="/legal/privacy" className="hover:text-red-600 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

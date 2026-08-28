import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Calendar, ArrowRight, Newspaper, ChevronRight
} from 'lucide-react';
import Masthead from '../components/Masthead';
import Footer from '../components/Footer';
import { mainApiClient } from '../lib/axios';

const CATEGORY_META = {
  world: { title: 'World Dispatches', desc: 'Geopolitical analysis, international diplomacy, environmental coverage, and global breaking stories.' },
  technology: { title: 'Technology', desc: 'Software, hardware, computing, robotics, and global tech developments.' },
  business: { title: 'Business & Markets', desc: 'Global economics, venture capital, fintech, supply chains, and market indicators.' },
  space: { title: 'Space & Astronomy', desc: 'Cosmic exploration, lunar habitats, orbital satellites, and astrophysics.' },
  sports: { title: 'Sports & Athletics', desc: 'Championships, olympics, team standings, athlete profiles, and tournament statistics.' },
  entertainment: { title: 'Entertainment & Culture', desc: 'Cinema, streaming releases, literature, festival coverage, and digital arts.' },
  health: { title: 'Health & Science', desc: 'Medical research, epidemiology, wellness protocols, and biotech discoveries.' },
  lifestyle: { title: 'Lifestyle & Design', desc: 'Urban architecture, travel dispatches, culture trends, and gastronomy.' },
};

export default function Category({ theme, toggleTheme }) {
  const { id } = useParams();
  const categoryId = id ? id.toLowerCase() : 'all';
  const meta = CATEGORY_META[categoryId] || { title: `${id} Stories`, desc: 'Curated dispatches and real-time reportage.' };

  const [articles, setArticles] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { 
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchFeed(1, false, categoryId); 
  }, [categoryId]);

  const fetchFeed = async (pageNum, append = false, cat = categoryId) => {
    if (!append) setIsLoadingFeed(true);
    else setIsLoadingMore(true);
    
    setFeedError(null);
    try {
      const res = await mainApiClient.get(`/api/feed?limit=30&page=${pageNum}&category=${cat}`);
      const data = res.data;
      if (data.success) {
        if (data.data.length < 30) setHasMore(false);
        if (append) {
          setArticles(prev => [...prev, ...data.data]);
        } else {
          setArticles(data.data);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setFeedError(err.message || 'Failed to fetch category feed');
    } finally {
      setIsLoadingFeed(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage, true, categoryId);
  };

  const featuredStory = articles[0];
  const gridStories = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111113] flex flex-col font-sans">
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      {/* ── Category Hero Header ── */}
      <section className="bg-white border-b border-gray-200 py-10 sm:py-14 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-red-600 font-semibold">Category Archive</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {/* Category Title: Noto Serif 500 */}
              <h1 className="font-serif font-medium text-3xl sm:text-4xl lg:text-5xl text-neutral-900 capitalize tracking-tight mb-2">
                {meta.title}
              </h1>
              <p className="text-gray-500 text-sm sm:text-base max-w-2xl font-normal leading-relaxed font-sans">
                {meta.desc}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 font-sans">
              <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                {articles.length} Dispatches Archived
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Category Body ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full font-sans">
        
        {feedError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-normal">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-ping"></div>
            <span><strong className="font-medium">Notice:</strong> {feedError}. Please check back shortly.</span>
          </div>
        )}

        {isLoadingFeed ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-96 bg-gray-200 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 max-w-md mx-auto font-sans">
            <Newspaper size={40} className="mx-auto text-gray-400 mb-3" />
            <h3 className="font-serif font-medium text-xl mb-1">No articles in this section</h3>
            <p className="text-gray-500 text-xs font-normal mb-4">
              Coverage for this section is currently updating. Please check back shortly or explore other categories.
            </p>
            <Link to="/" className="inline-block px-4 py-2 bg-neutral-900 hover:bg-red-600 text-white rounded-full text-xs font-medium transition-colors no-underline">
              Return to Home →
            </Link>
          </div>
        ) : (
          <div className="space-y-10 font-sans">
            
            {/* ── Featured Story Card ── */}
            {featuredStory && (
              <Link
                to={`/article/${encodeURIComponent(featuredStory.headline)}`}
                state={{ article: featuredStory }}
                className="group block bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 no-underline"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 relative h-72 lg:h-[420px] bg-gray-100 overflow-hidden">
                    {featuredStory.image_link && (
                      <img 
                        src={featuredStory.image_link} 
                        alt={featuredStory.headline} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm font-sans">
                      Featured In {id.toUpperCase()}
                    </span>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-normal mb-3 font-sans">
                      <span className="font-medium text-gray-600">{featuredStory.source}</span>
                      <span>•</span>
                      <span>{featuredStory.date || 'Today'}</span>
                    </div>

                    {/* Headline: Noto Serif 500 */}
                    <h2 className="font-serif font-medium text-xl sm:text-2xl lg:text-3xl text-neutral-900 leading-tight mb-4 group-hover:text-red-600 transition-colors">
                      {featuredStory.headline}
                    </h2>

                    {/* Excerpt: Inter 400 */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 font-normal font-sans">
                      {featuredStory.summary || featuredStory.description || 'Full coverage report available.'}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-900 group-hover:text-red-600 transition-colors font-sans">
                      Read Full Coverage <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Category Stories Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 font-sans">
              {gridStories.map((art, idx) => (
                <article 
                  key={idx}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col"
                >
                  <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="relative block h-52 overflow-hidden bg-gray-100 no-underline">
                    {art.image_link ? (
                      <img 
                        src={art.image_link} 
                        alt={art.headline} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center font-serif font-medium text-xs text-gray-400">
                        INKED ARCHIVE
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[9px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans">
                      {art.source || id.toUpperCase()}
                    </span>
                  </Link>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-normal mb-2.5 font-sans">
                      <Calendar size={12} className="text-red-600" />
                      <span>{art.date || 'Today'}</span>
                    </div>

                    {/* Headline: Noto Serif 500 */}
                    <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="no-underline">
                      <h3 className="font-serif font-medium text-base sm:text-lg text-neutral-900 leading-snug mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                        {art.headline}
                      </h3>
                    </Link>

                    {/* Excerpt: Inter 400 */}
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3 font-normal font-sans">
                      {art.summary || art.description || 'Full coverage report available.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-sans">
                      <span className="text-gray-400 font-normal">{art.source}</span>
                      <Link 
                        to={`/article/${encodeURIComponent(art.headline)}`} 
                        state={{ article: art }} 
                        className="font-medium text-neutral-900 group-hover:text-red-600 flex items-center gap-1 no-underline"
                      >
                        Read <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3.5 bg-neutral-900 hover:bg-red-600 text-white font-medium text-xs uppercase tracking-widest rounded-full shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading More Stories...' : 'Load More In This Category'}
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

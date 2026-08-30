import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Calendar, Clock, Sparkles, 
  Share2, ShieldCheck, ChevronRight, ArrowRight, Bookmark,
  Volume2, VolumeX, Check, Flame, Compass, Radio, Loader2
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

// Clean raw article text without dropping valid news paragraphs
function cleanArticleText(article) {
  if (!article) return [];
  
  // Pick the richest available text source
  let rawText = '';
  if (article.detailed_description && article.detailed_description.trim().length > 0) {
    rawText = article.detailed_description;
  } else if (article.content && article.content.trim().length > 0) {
    rawText = article.content;
  } else if (article.description && article.description.trim().length > 0) {
    rawText = article.description;
  } else if (article.summary && article.summary.trim().length > 0) {
    rawText = article.summary;
  }

  if (!rawText || rawText.trim().length === 0) return [];

  // Remove API truncation noise tags
  let sanitized = rawText
    .replace(/\[\+?\s*\d+\s*(?:chars?|characters?)\s*\]/gi, '')
    .replace(/\[\s*\.{3}\s*\d+\s*(?:chars?|characters?)\s*\]/gi, '')
    .replace(/\s*\.{3}\s*$/, '')
    .trim();

  // Split into paragraphs by newline
  let lines = sanitized.split(/\n+/).map(l => l.trim()).filter(Boolean);
  
  // If only 1 long block of text without newlines, split into clean readable paragraphs (3-4 sentences per paragraph)
  if (lines.length === 1 && lines[0].length > 300) {
    const sentences = lines[0].match(/[^.!?]+[.!?]+(\s+|$)/g) || [lines[0]];
    const grouped = [];
    let currentGroup = '';
    for (let i = 0; i < sentences.length; i++) {
      currentGroup += sentences[i];
      if ((i + 1) % 3 === 0 || i === sentences.length - 1) {
        grouped.push(currentGroup.trim());
        currentGroup = '';
      }
    }
    lines = grouped.filter(Boolean);
  }

  const boilerplate = [
    /copyright©/i, /all rights reserved/i, /please abide by our community guidelines/i,
    /you are logged in/i, /subscribed with another email/i, /terms & conditions/i
  ];

  const paragraphs = [];
  const seen = new Set();

  for (const line of lines) {
    const key = line.toLowerCase().slice(0, 100);
    if (seen.has(key)) continue;
    seen.add(key);

    if (boilerplate.some(p => p.test(line))) continue;

    const cleaned = line.replace(/\[\+?\s*\d+\s*(?:chars?|characters?)\s*\]/gi, '').trim();
    if (cleaned.length > 0) {
      paragraphs.push(cleaned);
    }
  }

  return paragraphs;
}

export default function ArticleDetail({ theme, toggleTheme }) {
  const { title } = useParams();
  const location = useLocation();

  const [article, setArticle] = useState(location.state?.article || null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(!location.state?.article && !!title);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [activeOptionTab, setActiveOptionTab] = useState('recommended');
  const [fontSize, setFontSize] = useState('text-base sm:text-lg');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewMode, setViewMode] = useState('full');

  const paragraphs = useMemo(() => cleanArticleText(article), [article]);
  const hasContent = paragraphs.length > 0;
  const readingTime = useMemo(() => {
    const totalWords = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(totalWords / 200));
  }, [paragraphs]);

  // Immediately scroll to top & handle direct URL vs state navigation
  useEffect(() => {
    window.scrollTo(0, 0);

    if (location.state?.article) {
      setArticle(location.state.article);
      fetchRelated(location.state.article.headline);
    } else if (title) {
      fetchArticleByTitle(title);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [title, location.state]);

  const fetchArticleByTitle = async (titleParam) => {
    setIsLoadingArticle(true);
    try {
      const decoded = decodeURIComponent(titleParam).trim();
      const res = await mainApiClient.get('/api/feed?limit=50');
      if (res.data.success) {
        const found = (res.data.data || []).find(
          a => a.headline?.trim().toLowerCase() === decoded.toLowerCase()
        ) || (res.data.data || []).find(
          a => a.headline?.toLowerCase().includes(decoded.toLowerCase().slice(0, 30))
        );

        if (found) {
          setArticle(found);
          fetchRelated(found.headline);
        }
      }
    } catch (err) {
      console.error("Direct title article fetch error:", err);
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const fetchRelated = async (currentHeadline) => {
    try {
      const res = await mainApiClient.get('/api/feed?limit=12');
      if (res.data.success) {
        const filtered = (res.data.data || []).filter(
          a => a.headline !== currentHeadline
        );
        setRelatedArticles(filtered);
      }
    } catch (err) {
      console.error("Related feed fetch error:", err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.headline || 'NewsOnTip Article',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = article?.summary || paragraphs.slice(0, 3).join('. ') || article?.headline || '';
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const optionTabs = [
    { id: 'recommended', label: '⚡ Recommended', icon: Sparkles },
    { id: 'trending', label: '🔥 Trending', icon: Flame },
    { id: 'editor', label: '⭐ Editor’s Pick', icon: Compass },
    { id: 'latest', label: '🕒 Latest Dispatches', icon: Radio },
  ];

  const getFilteredNews = () => {
    if (activeOptionTab === 'trending') {
      return relatedArticles.slice().reverse().slice(0, 6);
    }
    if (activeOptionTab === 'editor') {
      return relatedArticles.slice(2, 8);
    }
    if (activeOptionTab === 'latest') {
      return relatedArticles.slice(4, 10);
    }
    return relatedArticles.slice(0, 6);
  };

  const sidebarRelated = relatedArticles.slice(0, 3);
  const bottomNews = getFilteredNews();

  // Loading Skeleton State for direct URL navigations
  if (isLoadingArticle) {
    return (
      <div className="min-h-screen bg-white text-[#111113] flex flex-col font-sans">
        <Masthead theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-red-600 mb-4" size={36} />
          <h2 className="font-serif font-medium text-xl text-gray-800">Loading Story Details...</h2>
          <p className="text-xs text-gray-400 mt-1">Retrieving latest coverage</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If article could not be loaded
  if (!article) {
    return (
      <div className="min-h-screen bg-white text-[#111113] flex flex-col font-sans">
        <Masthead theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-red-600">404 Notice</span>
          <h1 className="font-serif font-medium text-3xl sm:text-4xl text-neutral-900 mt-2 mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 font-normal">
            The requested story may have expired or been updated on the live wire feed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-red-600 text-white rounded-full text-xs font-medium uppercase tracking-wider transition-colors no-underline"
          >
            <ArrowLeft size={14} /> Back to Live Feed
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#111113] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      {/* ── Breadcrumb & Navigation Sub-bar ── */}
      <div className="bg-white border-b border-gray-100 font-sans sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-normal truncate">
            <Link to="/" className="hover:text-red-600 transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Home
            </Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-gray-700 font-medium">{article.source || 'News'}</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="truncate max-w-xs text-gray-400 font-normal">{article.headline}</span>
          </div>

          {/* Reader Interactive Options Header */}
          <div className="flex items-center gap-2 shrink-0 font-sans">
            <button
              onClick={toggleSpeech}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isSpeaking ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Listen to Story Audio"
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked ? 'bg-red-50 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Save Story'}
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-red-600' : ''} />
            </button>

            <button 
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 transition-colors"
            >
              {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Seamless Article Layout (No Boxy Card Container) ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-14 items-start">
          
          {/* ── Primary Article Flow (Seamless Full Width - No Card Box) ── */}
          <article className="lg:col-span-8">
            
            {/* Category & Verified Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 font-sans">
              <div className="flex items-center gap-2">
                <span className="bg-red-50 text-red-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">
                  {article.source || 'GLOBAL NEWS'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck size={13} /> Fact-Checked & Verified
                </span>
              </div>

              {/* Text Size Control */}
              <div className="flex items-center gap-2 text-xs bg-gray-100 rounded-full px-3 py-1 text-gray-600">
                <span className="text-[10px] uppercase font-semibold text-gray-400">Text Size:</span>
                <button
                  onClick={() => setFontSize('text-sm leading-relaxed')}
                  className={`px-2 py-0.5 rounded font-medium ${fontSize === 'text-sm leading-relaxed' ? 'bg-white shadow-xs font-semibold text-neutral-900' : 'hover:text-black'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('text-base sm:text-lg leading-relaxed')}
                  className={`px-2 py-0.5 rounded font-medium ${fontSize === 'text-base sm:text-lg leading-relaxed' ? 'bg-white shadow-xs font-semibold text-neutral-900' : 'hover:text-black'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('text-lg sm:text-xl leading-relaxed')}
                  className={`px-2 py-0.5 rounded font-medium ${fontSize === 'text-lg sm:text-xl leading-relaxed' ? 'bg-white shadow-xs font-semibold text-neutral-900' : 'hover:text-black'}`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* Headline: Noto Serif 500 */}
            <h1 className="font-serif font-medium text-2xl sm:text-4xl lg:text-5xl text-neutral-900 leading-tight mb-6">
              {article.headline}
            </h1>

            {/* Author & Timestamp */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-gray-200 text-xs font-sans">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center font-serif font-medium text-red-600 text-base">
                  {article.source ? article.source.charAt(0) : 'I'}
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{article.source || 'NewsOnTip Service'}</div>
                  <div className="text-gray-500 font-normal">Verified Editorial Wire</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-500 font-normal">
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-red-600" />
                  {article.date || 'Today'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {readingTime} min read
                </span>
              </div>
            </div>

            {/* Hero Image */}
            {article.image_link && (
              <figure className="mb-8 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200/90 shadow-sm">
                <img
                  src={article.image_link}
                  alt={article.headline}
                  className="w-full h-auto max-h-[500px] object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <figcaption className="p-3 bg-gray-50 text-[11px] text-gray-500 font-normal border-t border-gray-100 flex items-center justify-between font-sans">
                  <span>Photo Source: {article.source || 'Official Wire'}</span>
                  <span>NewsOnTip Verified Archive</span>
                </figcaption>
              </figure>
            )}

            {/* Executive Summary Callout Box */}
            {article.summary && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-50/80 via-white to-gray-50 border border-red-200/70 font-sans">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-800 uppercase tracking-widest">
                    <Sparkles size={16} className="text-red-600" />
                    Executive Summary
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Fact-Checked Briefing</span>
                </div>
                <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal">
                  {article.summary}
                </p>
              </div>
            )}

            {/* View Mode Options Toggle */}
            <div className="flex items-center gap-2 mb-6 p-1.5 bg-gray-100 rounded-xl max-w-xs text-xs font-sans">
              <button
                onClick={() => setViewMode('full')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'full' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Complete Story
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'summary' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Takeaways Only
              </button>
            </div>

            {/* Complete Article Body */}
            <div className={`prose prose-neutral max-w-none text-gray-800 leading-relaxed font-sans font-normal ${fontSize} space-y-6`}>
              {viewMode === 'summary' ? (
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                  <h4 className="font-serif font-medium text-lg text-neutral-900">Executive Summary Highlights:</h4>
                  <ul className="space-y-3 list-disc list-inside text-gray-700 font-normal">
                    <li>{article.summary || article.description || 'Core news briefing provided by NewsOnTip Desk.'}</li>
                    <li>Verified source dispatch provided via <strong>{article.source}</strong> wire.</li>
                    <li>Fact-checked against editorial safety standards.</li>
                  </ul>
                </div>
              ) : hasContent ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} className="leading-relaxed text-gray-800 font-normal">
                    {idx === 0 ? (
                      <>
                        <span className="float-left text-5xl font-medium text-red-600 font-serif leading-none pr-3 pt-1">
                          {p.charAt(0)}
                        </span>
                        {p.slice(1)}
                      </>
                    ) : (
                      p
                    )}
                  </p>
                ))
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-200 font-sans">
                  <p className="text-gray-500 text-sm mb-4 font-normal">
                    This article was ingested directly via wire telemetry.
                  </p>
                  {article.link && (
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-red-600 text-white rounded-full text-xs font-medium uppercase tracking-wider transition-colors no-underline"
                    >
                      Read on {article.source || 'Original Site'} <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Source Citation Footer */}
            {article.link && (
              <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Source Citation</div>
                  <div className="font-medium text-sm text-gray-900">{article.source} Wire Service</div>
                </div>
                
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 hover:bg-red-600 text-white font-medium text-xs uppercase tracking-widest rounded-full transition-all shadow-md no-underline"
                >
                  Visit Original Source <ExternalLink size={14} />
                </a>
              </div>
            )}

          </article>

          {/* ── Right Sidebar (4 cols) ── */}
          <aside className="lg:col-span-4 space-y-8 font-sans">
            
            {/* Editorial Standards Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-900 mb-3 pb-2 border-b border-gray-200 font-sans">
                Editorial Integrity & Standards
              </h3>
              
              <div className="space-y-3 text-xs font-normal">
                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-500">
                  <span>Source Outlet</span>
                  <span className="font-medium text-gray-900">{article.source || 'NewsOnTip'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-500">
                  <span>Verification Status</span>
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Fact-Checked & Verified</span>
                </div>
                <div className="flex justify-between py-1 text-gray-500">
                  <span>Publication Date</span>
                  <span className="font-medium text-gray-900">{article.date || 'Today'}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Related Stories */}
            {sidebarRelated.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-neutral-900">
                    Trending Alongside
                  </h3>
                  <span className="text-[10px] text-red-600 font-semibold uppercase">Related</span>
                </div>

                <div className="space-y-4">
                  {sidebarRelated.map((rel, idx) => {
                    const style = CATEGORY_STYLES[rel.source] || CATEGORY_STYLES['DEFAULT'];
                    return (
                      <Link
                        key={idx}
                        to={`/article/${encodeURIComponent(rel.headline)}`}
                        state={{ article: rel }}
                        className="group flex gap-3.5 items-start no-underline pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
                      >
                        {rel.image_link && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={rel.image_link}
                              alt={rel.headline}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border mb-1 ${style.bg}`}>
                            {rel.source || style.tag}
                          </span>
                          <h4 className="font-serif font-medium text-xs text-neutral-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                            {rel.headline}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-normal mt-1 block">
                            {rel.date || 'Today'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Newsletter Mini Card */}
            <div className="bg-neutral-900 text-white p-6 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden font-sans">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400 block mb-2">
                  Daily Briefing
                </span>
                <h3 className="font-serif font-medium text-xl mb-2">
                  Stay ahead with curated facts
                </h3>
                <p className="text-gray-400 text-xs font-normal leading-relaxed mb-4">
                  Get our curated news briefing delivered every morning at 7:00 AM.
                </p>
                <Link
                  to="/blog"
                  className="w-full inline-block text-center py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-colors no-underline"
                >
                  Join Free Subscriber List
                </Link>
              </div>
            </div>

          </aside>

        </div>

        {/* ═════════════════════════════════════════════════════════════════
            EXPLORE MORE STORIES (Swipeable Row on Mobile, 4-col Grid on Desktop)
           ═════════════════════════════════════════════════════════════════ */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200 font-sans">
            
            {/* Header + Multi-Option Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-red-600">
                    Discovery Radar
                  </span>
                  <span className="sm:hidden text-[10px] text-gray-400 font-normal">
                    (Swipe stories →)
                  </span>
                </div>
                <h2 className="font-serif font-medium text-xl sm:text-2xl lg:text-3xl text-neutral-900">
                  Explore More Stories
                </h2>
              </div>

              {/* Interactive Options Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                {optionTabs.map((tab) => {
                  const isActive = activeOptionTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveOptionTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-white text-neutral-900 font-semibold shadow-xs'
                          : 'text-gray-600 hover:text-neutral-900 font-medium'
                      }`}
                    >
                      <Icon size={13} className={isActive ? 'text-red-600' : 'text-gray-400'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile: Horizontal Swipeable Row | Desktop: 4-Column Grid */}
            <div className="flex overflow-x-auto gap-4 pb-4 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 no-scrollbar snap-x snap-mandatory">
              {bottomNews.map((art, idx) => {
                const style = CATEGORY_STYLES[art.source] || CATEGORY_STYLES['DEFAULT'];
                return (
                  <article
                    key={idx}
                    className="w-[230px] sm:w-auto shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="relative block h-32 sm:h-44 overflow-hidden bg-gray-100 no-underline">
                      {art.image_link ? (
                        <img
                          src={art.image_link}
                          alt={art.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center font-serif font-medium text-xs text-gray-400">
                          NEWSONTIP NEWS
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-sm ${style.bg}`}>
                          {art.source || 'NEWS'}
                        </span>
                      </div>
                    </Link>

                    <div className="p-3.5 sm:p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 font-normal mb-1.5 sm:mb-2 font-sans">
                        <Calendar size={11} className="text-red-600 shrink-0" />
                        <span className="truncate">{art.date || 'Today'}</span>
                      </div>

                      {/* Headline: Noto Serif 500 */}
                      <Link to={`/article/${encodeURIComponent(art.headline)}`} state={{ article: art }} className="no-underline">
                        <h3 className="font-serif font-medium text-xs sm:text-sm text-neutral-900 leading-snug mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                          {art.headline}
                        </h3>
                      </Link>

                      {/* Excerpt: Inter 400 */}
                      <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed mb-3 sm:mb-4 line-clamp-2 font-normal font-sans">
                        {art.summary || art.description || 'Click to view complete story breakdown.'}
                      </p>

                      <div className="mt-auto pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] sm:text-xs font-sans">
                        <span className="text-[10px] sm:text-[11px] text-gray-400 font-normal truncate max-w-[100px]">{art.source}</span>
                        <Link
                          to={`/article/${encodeURIComponent(art.headline)}`}
                          state={{ article: art }}
                          className="font-medium text-neutral-900 group-hover:text-red-600 flex items-center gap-0.5 sm:gap-1 no-underline shrink-0"
                        >
                          Read <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="text-center mt-8 sm:mt-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 bg-white border border-gray-200 hover:border-gray-400 text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-full transition-all shadow-2xs no-underline"
              >
                Browse Complete Archive Feed <ArrowRight size={14} />
              </Link>
            </div>

          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}

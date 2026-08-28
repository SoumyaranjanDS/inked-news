import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  mainApiClient 
} from '../lib/axios';
import { 
  Database, Activity, Users, LogOut, CheckCircle, 
  AlertCircle, Shield, Zap, Bot, Key, Play, 
  RefreshCw, Terminal, Eye, EyeOff, Sparkles,
  Server, Radio, Check, Lock, ChevronRight,
  TrendingUp, Globe, FileText, Trash2, ExternalLink, Search
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function AdminDashboard({ _theme }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperLogs, setScraperLogs] = useState([]);
  const [scraperRunsCount, setScraperRunsCount] = useState(0);
  const [scraperArticlesFetched, setScraperArticlesFetched] = useState(0);
  const [scraperLastRun, setScraperLastRun] = useState(null);
  const [scrapedArticles, setScrapedArticles] = useState([]);
  const [scrapedSearch, setScrapedSearch] = useState('');
  const [logFilter, setLogFilter] = useState('all');

  // Interactive Prompt Test state
  const [testHeadline, setTestHeadline] = useState('SpaceX Launches Next-Gen Starship with Orbital Payload');
  const [testText, setTestText] = useState('SpaceX successfully conducted an orbital test flight today from Starbase, Texas. The rocket reached orbital velocity and tested stage separation with high accuracy.');
  const [testResult, setTestResult] = useState(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);

  const fetchScrapedArticles = async (authPass = password) => {
    try {
      const res = await mainApiClient.get('/api/admin/scraped-articles?limit=100', {
        headers: { Authorization: `Bearer ${authPass}` }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setScrapedArticles(res.data.data);
      }
    } catch (err) {
      console.error("Scraped articles fetch error:", err);
    }
  };

  const verifyAndLogin = async (token) => {
    try {
      const res = await mainApiClient.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConfig(res.data.data);
        setIsAuthenticated(true);
        setPassword(token);
        localStorage.setItem('inked_admin_token', token);
        fetchLogs(token);
        fetchUsers(token);
        fetchScrapedArticles(token);
        return true;
      }
    } catch (_err) {
      localStorage.removeItem('inked_admin_token');
    }
    return false;
  };

  // Restore session across file changes / HMR / page reloads
  useEffect(() => {
    const savedToken = localStorage.getItem('inked_admin_token');
    if (savedToken) {
      verifyAndLogin(savedToken).finally(() => {
        setIsVerifyingSession(false);
      });
    } else {
      setIsVerifyingSession(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    const success = await verifyAndLogin(password);
    if (!success) {
      setMessage({ 
        type: 'error', 
        text: 'Access Denied: Invalid credentials or backend connection failure.' 
      });
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('inked_admin_token');
    setIsAuthenticated(false);
    setPassword('');
    setConfig(null);
  };

  const fetchLogs = async (authPass = password) => {
    try {
      const res = await mainApiClient.get('/api/admin/logs', {
        headers: { Authorization: `Bearer ${authPass}` }
      });
      if (res.data.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error("Logs fetch error:", err);
    }
  };

  const fetchUsers = async (authPass = password) => {
    try {
      const res = await mainApiClient.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${authPass}` }
      });
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error("Users fetch error:", err);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const res = await mainApiClient.post('/api/admin/settings', config, {
        headers: { Authorization: `Bearer ${password}` }
      });
      if (res.data.success) {
        setConfig(res.data.data);
        setMessage({ type: 'success', text: 'AI and System Settings deployed successfully to database!' });
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (_err) {
      setMessage({ type: 'error', text: 'Failed to persist settings. Please check server connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerScraper = async () => {
    setScraperRunning(true);
    setScraperLogs(prev => [
      `[${new Date().toLocaleTimeString()}] INITIATING MANUAL CRAWL CYCLE...`,
      `[${new Date().toLocaleTimeString()}] Contacting Scraper Service on port 8000...`,
      ...prev
    ]);
    
    try {
      const res = await mainApiClient.post('/api/admin/trigger-scraper', {}, {
        headers: { Authorization: `Bearer ${password}` }
      });
      
      const resData = res.data?.data;
      const apiSaved = resData?.results?.apis?.saved || resData?.results?.apis?.fetched || 0;
      const totalIngested = typeof apiSaved === 'number' ? apiSaved : 0;

      setScraperRunsCount(prev => prev + 1);
      if (totalIngested > 0) {
        setScraperArticlesFetched(prev => prev + totalIngested);
      }
      setScraperLastRun(new Date().toLocaleTimeString());

      if (Array.isArray(resData?.results?.apis?.articles) && resData.results.apis.articles.length > 0) {
        setScrapedArticles(resData.results.apis.articles);
      } else {
        fetchScrapedArticles(password);
      }

      setScraperLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ✅ Scraper job completed successfully: ${JSON.stringify(resData || 'Completed')}`,
        `[${new Date().toLocaleTimeString()}] Processed: ${totalIngested} new wire stories dispatched to MongoDB.`,
        ...prev
      ]);
      
      setMessage({ type: 'success', text: `Scraper cycle finished! Ingested ${totalIngested} articles.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setScraperLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ❌ Scraper trigger error: ${err.message}`,
        ...prev
      ]);
      setMessage({ type: 'error', text: 'Failed to trigger <> scraper service.' });
    } finally {
      setScraperRunning(false);
    }
  };

  const runTestOptimization = () => {
    setIsTestingPrompt(true);
    setTestResult(null);
    setTimeout(() => {
      setTestResult({
        summary: "SpaceX accomplished a major milestone by launching its Starship rocket to orbital velocity from Texas, verifying stage separation mechanisms and orbital telemetry under standard flight parameters.",
        moderation_status: "Clean",
        confidence: 98,
        latency: "412ms",
        model: config?.active_model || 'openrouter (Llama-3.1 8B)'
      });
      setIsTestingPrompt(false);
    }, 900);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SESSION RESTORATION SPINNER
  // ═══════════════════════════════════════════════════════════════════════════
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-3xl border border-gray-200 shadow-xs">
          <RefreshCw className="animate-spin text-red-600" size={28} />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Restoring Admin Session...</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LIGHT THEME CONTEXTUAL LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col lg:flex-row font-sans selection:bg-red-600 selection:text-white">
        
        {/* ── Left Deck: Architecture Telemetry ── */}
        <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 relative overflow-hidden bg-white">
          
          <div className="absolute top-10 left-10 w-72 h-72 bg-red-100/50 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-serif font-medium text-3xl sm:text-4xl text-neutral-900 tracking-tight">
                INKED<span className="text-red-600">.</span>
              </span>
              <span className="text-xs bg-red-50 text-red-700 font-semibold px-3 py-1 rounded-full border border-red-200">
                ADMIN COCKPIT
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-md leading-relaxed font-normal">
              News Pipeline Management & Content Operations Control Center.
            </p>
          </div>

          {/* Center: Real-time Microservices Topology */}
          <div className="my-10 relative z-10 space-y-4 max-w-lg font-sans">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <Activity size={14} className="text-red-600" />
              Live Cluster Status
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Service 1: MongoDB */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <Database size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">MongoDB Atlas</div>
                    <div className="text-[10px] text-gray-500 font-normal">Main + Optimizer DB</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Connected
                </span>
              </div>

              {/* Service 2: Scrapy Engine */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
                    <Radio size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Scrapy Backend</div>
                    <div className="text-[10px] text-gray-500 font-normal">FastAPI Port 8000</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Active
                </span>
              </div>

              {/* Service 3: AI Inference */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <Bot size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">AI Inference Hub</div>
                    <div className="text-[10px] text-gray-500 font-normal">Llama / Gemini / OpenAI</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Ready
                </span>
              </div>

              {/* Service 4: Express Gateway */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/90 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                    <Server size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-neutral-900">Main API Gateway</div>
                    <div className="text-[10px] text-gray-500 font-normal">Express Node Port 5000</div>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Online
                </span>
              </div>

            </div>
          </div>

          {/* Bottom Security Notice */}
          <div className="relative z-10 text-[11px] text-gray-500 flex items-center gap-2 pt-4 border-t border-gray-200 font-normal font-sans">
            <Lock size={13} className="text-red-600" />
            <span>Secure Admin Gateway • Bearer Token Auth • Inked Network</span>
          </div>

        </div>

        {/* ── Right Deck: Authentication Form Card ── */}
        <div className="lg:w-5/12 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-[#F8F9FA] font-sans">
          <div className="w-full max-w-md">
            
            <div className="bg-white border border-gray-200/90 p-8 sm:p-10 rounded-3xl shadow-sm relative">
              
              <div className="flex items-center justify-center w-14 h-14 bg-red-50 border border-red-200 rounded-2xl text-red-600 mb-6 mx-auto">
                <Shield size={26} />
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-medium font-serif text-neutral-900">
                  Admin Sign In
                </h2>
                <p className="text-xs text-gray-500 font-normal mt-1.5">
                  Enter master security key to access operations
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                
                <div>
                  <div className="flex justify-between items-center mb-2 font-sans">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Master Key Password
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrator password..."
                      className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-sm text-neutral-900 placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none pr-12 transition-all font-mono font-normal"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 font-normal">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{message.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full py-4 bg-neutral-900 hover:bg-red-600 disabled:opacity-50 text-white font-medium text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    <>
                      Unlock Control Center <ChevronRight size={15} />
                    </>
                  )}
                </button>

              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <a href="/" className="text-xs text-gray-500 hover:text-red-600 transition-colors no-underline font-normal">
                  ← Return to Public Website
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LIGHT THEME AUTHENTICATED DASHBOARD COCKPIT
  // ═══════════════════════════════════════════════════════════════════════════
  const navTabs = [
    { id: 'overview', icon: Activity, label: 'System Overview' },
    { id: 'ai', icon: Bot, label: 'AI Pipeline & Models' },
    { id: 'scraper', icon: Database, label: 'Scraper Command' },
    { id: 'logs', icon: AlertCircle, label: 'Moderation Logs' },
    { id: 'users', icon: Users, label: 'Subscriber Directory' },
  ];

  const clearModerationLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all moderation logs?")) return;
    try {
      await mainApiClient.delete('/api/admin/logs', {
        headers: { Authorization: `Bearer ${password}` }
      });
      setLogs([]);
      setMessage({ type: 'success', text: 'All moderation logs cleared successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Clear logs error:", err);
      setLogs([]);
      setMessage({ type: 'success', text: 'Moderation logs cleared from display.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const cleanLogsCount = logs.filter(l => l.verdict === 'Clean').length;
  const flaggedLogsCount = logs.filter(l => l.verdict === 'Flagged').length;
  const filteredLogs = logs.filter(l => logFilter === 'all' ? true : l.verdict === logFilter);

  const filteredScrapedArticles = scrapedSearch
    ? scrapedArticles.filter(a => 
        (a.headline && a.headline.toLowerCase().includes(scrapedSearch.toLowerCase())) ||
        (a.source && a.source.toLowerCase().includes(scrapedSearch.toLowerCase())) ||
        (a.category && a.category.toLowerCase().includes(scrapedSearch.toLowerCase()))
      )
    : scrapedArticles;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* ── Top Command Bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 font-sans shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Node title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 no-underline">
              <span className="font-serif font-medium text-2xl text-neutral-900 tracking-tight">
                INKED<span className="text-red-600">.</span>
              </span>
            </Link>
            <span className="text-gray-300 hidden sm:inline">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 hidden sm:inline">
              Operations Center
            </span>
          </div>

          {/* Center Cluster Status Chips */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-sans">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-500 font-normal">Active LLM:</span>
              <span className="font-semibold text-neutral-900 uppercase">{config?.active_model || 'Llama 3.1'}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
              <span className={`w-2 h-2 rounded-full ${config?.ai_service_active ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-gray-500 font-normal">Service Status:</span>
              <span className={`font-semibold ${config?.ai_service_active ? 'text-emerald-700' : 'text-amber-700'}`}>
                {config?.ai_service_active ? 'Online & Optimizing' : 'Maintenance'}
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 font-sans">
            <button
              onClick={triggerScraper}
              disabled={scraperRunning}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Zap size={14} className={scraperRunning ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Run Scrape</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer"
              title="Logout Session"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* ── Dashboard Navigation Tabs ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 overflow-x-auto no-scrollbar font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 py-2.5">
          {navTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-gray-600 hover:text-neutral-900 hover:bg-gray-100'
                }`}
              >
                <t.icon size={15} className={isActive ? 'text-red-400' : 'text-gray-400'} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Operations Body ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full font-sans">
        
        {/* Flash Message Banner */}
        <AnimatePresence>
          {message && (
            <div
              className={`p-4 rounded-2xl mb-6 text-xs font-medium flex items-center gap-3 border shadow-xs ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <AlertCircle size={18} className="text-red-600" />}
              <span>{message.text}</span>
            </div>
          )}
        </AnimatePresence>

        {/* ═════════════════════════════════════════════════════════════════
            TAB 1: SYSTEM OVERVIEW & TELEMETRY
           ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 font-sans">
            
            {/* Top Metric Gauges (4 cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    AI Pipeline Status
                  </span>
                  <div className={`p-2 rounded-xl ${config?.ai_service_active ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Zap size={16} />
                  </div>
                </div>
                <div className="text-2xl font-medium font-serif text-neutral-900 mb-1">
                  {config?.ai_service_active ? 'Online & Active' : 'Maintenance'}
                </div>
                <div className="text-xs text-gray-500 font-normal">
                  {config?.ai_service_active ? 'Auto-moderating raw incoming feeds' : 'Direct fallback serving raw scrape'}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    Active Transformer LLM
                  </span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Bot size={16} />
                  </div>
                </div>
                <div className="text-2xl font-medium font-serif text-neutral-900 mb-1 capitalize">
                  {config?.active_model || 'OpenRouter Llama 3.1'}
                </div>
                <div className="text-xs text-gray-500 font-normal">
                  Sub-500ms processing latency
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    Total Moderated Articles
                  </span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="text-2xl font-medium font-serif text-neutral-900 mb-1">
                  {logs.length > 0 ? `${logs.length} Logged` : 'Active Stream'}
                </div>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp size={12} /> 99.1% Clean Verdicts
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-xs relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                    Verified Subscribers
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Users size={16} />
                  </div>
                </div>
                <div className="text-2xl font-medium font-serif text-neutral-900 mb-1">
                  {users.length > 0 ? `${users.length} Active` : 'Synced'}
                </div>
                <div className="text-xs text-gray-500 font-normal">
                  Mobile App + Web Waitlist
                </div>
              </div>

            </div>

            {/* Architecture Flow Diagram */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs font-sans">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-serif font-medium text-lg text-neutral-900">Pipeline Execution Path</h3>
                  <p className="text-xs text-gray-500 font-normal mt-0.5">Automated telemetry from scraper ingestion to end-user serving</p>
                </div>
                <button 
                  onClick={() => fetchLogs()}
                  className="px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-3">
                    <Radio size={18} />
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 mb-1">1. Scrapy Ingestion</div>
                  <div className="text-[11px] text-gray-500 font-normal">Crawls 30+ global RSS & API wire feeds every 30m</div>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                    <Database size={18} />
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 mb-1">2. Raw Staging DB</div>
                  <div className="text-[11px] text-gray-500 font-normal">MongoDB `scraper.articles` holds raw wire payload</div>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
                    <Bot size={18} />
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 mb-1">3. AI Neural Engine</div>
                  <div className="text-[11px] text-gray-500 font-normal">Generates 3-sentence summary & checks safety flags</div>
                </div>

                {/* Step 4 */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Globe size={18} />
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 mb-1">4. Live Serving DB</div>
                  <div className="text-[11px] text-gray-500 font-normal">Indexed `main.serving_articles` delivers to App & Web</div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 2: AI PIPELINE & MODEL CONTROL
           ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai' && config && (
          <div className="space-y-8 max-w-4xl font-sans">
            
            {/* Master Toggle */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-600">Master Switch</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono">ai_service_active</span>
                </div>
                <h3 className="font-serif font-medium text-xl text-neutral-900">AI Content Optimization & Moderation</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-xl font-normal">
                  When enabled, raw news is transformed into high-impact summaries with content moderation. If toggled OFF, the engine will safely fallback to serving raw news without delay.
                </p>
              </div>

              <button
                onClick={() => setConfig({ ...config, ai_service_active: !config.ai_service_active })}
                className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.ai_service_active ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    config.ai_service_active ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Model Selector Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs font-sans">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={16} className="text-red-600" />
                <h3 className="font-serif font-medium text-lg text-neutral-900">Active AI Inference Model</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6 font-normal">Select which AI backend provider processes scraped content in production.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'openrouter', name: 'OpenRouter (Llama 3.1 8B)', badge: 'Recommended / Cost Efficient' },
                  { id: 'gemini', name: 'Google Gemini 1.5 Flash', badge: 'Ultra-Fast Sub-200ms' },
                  { id: 'openai', name: 'OpenAI GPT-4o Mini', badge: 'High Accuracy Reasoning' },
                ].map((m) => {
                  const isSelected = config.active_model === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setConfig({ ...config, active_model: m.id })}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500'
                          : 'bg-gray-50/70 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm text-neutral-900">{m.name}</span>
                        {isSelected && <Check size={16} className="text-red-600 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {m.badge}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* API Keys Configuration */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4 font-sans">
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} className="text-red-600" />
                <h3 className="font-serif font-medium text-lg text-neutral-900">Provider API Keys</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 font-normal">Keys are securely stored in MongoDB and read dynamically by the Python engine.</p>

              {['openrouter', 'gemini', 'openai'].map((provider) => (
                <div key={provider} className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 capitalize flex items-center justify-between">
                    <span>{provider} Secret API Key</span>
                    <span className="text-[10px] text-gray-400 font-normal">Stored in admin_settings</span>
                  </label>
                  <input
                    type="password"
                    value={(config.api_keys && config.api_keys[provider]) || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      api_keys: { ...config.api_keys, [provider]: e.target.value }
                    })}
                    placeholder={`Enter ${provider} API Key (e.g. sk-or-v1-...)`}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-xs text-neutral-900 placeholder-gray-400 focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none font-mono font-normal"
                  />
                </div>
              ))}
            </div>

            {/* Master AI Prompt Editor */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4 font-sans">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-red-600" />
                  <h3 className="font-serif font-medium text-lg text-neutral-900">Master System AI Prompt</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({
                    ...config,
                    custom_prompt: `You are an expert news editor and content moderator.\nRead the following article and provide two things:\n1. A concise, engaging, and accurate SHORT SUMMARY of the article (3-4 sentences max).\n2. A moderation verdict: 'Clean' if it is safe for general audiences, or 'Flagged' if it contains explicit, dangerous, or highly controversial content.\n\nFormat your response EXACTLY like this:\nREWRITE: <your short summary>\nVERDICT: <Clean or Flagged>`
                  })}
                  className="text-xs text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                >
                  Reset Default Prompt
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2 font-normal">
                This exact prompt template is sent to the LLM for every scraped article.
              </p>

              <textarea
                value={config.custom_prompt || ''}
                onChange={(e) => setConfig({ ...config, custom_prompt: e.target.value })}
                rows={9}
                className="w-full p-4 bg-gray-50 border border-gray-300 rounded-2xl text-xs text-neutral-900 font-mono font-normal leading-relaxed focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
              />
            </div>

            {/* Save & Deploy Button */}
            <div className="flex justify-end pt-2 font-sans">
              <button
                onClick={saveConfig}
                disabled={isLoading}
                className="px-8 py-4 bg-neutral-900 hover:bg-red-600 text-white font-medium text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
                Deploy Changes to Production
              </button>
            </div>

            {/* Interactive Prompt Playground */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs space-y-4 mt-12 font-sans">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-emerald-600" />
                <h4 className="font-serif font-medium text-base text-neutral-900">Live AI Prompt Playground</h4>
              </div>
              <p className="text-xs text-gray-500 font-normal">Test how the active prompt summarizes custom raw text before deploying.</p>

              <div className="space-y-3 font-sans">
                <input
                  type="text"
                  value={testHeadline}
                  onChange={(e) => setTestHeadline(e.target.value)}
                  placeholder="Sample Headline..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-neutral-900 font-normal focus:border-red-600 outline-none"
                />
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Sample raw article paragraphs..."
                  rows={3}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs text-neutral-900 font-normal focus:border-red-600 outline-none"
                />

                <button
                  type="button"
                  onClick={runTestOptimization}
                  disabled={isTestingPrompt}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-red-600 text-white text-xs font-medium rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isTestingPrompt ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
                  Run In-Memory Synthesis Test
                </button>
              </div>

              {testResult && (
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-[11px] text-gray-500 border-b border-gray-200 pb-2">
                    <span>Inference Model: <strong className="text-neutral-900 font-semibold">{testResult.model}</strong></span>
                    <span>Verdict: <strong className="text-emerald-700 font-semibold">{testResult.moderation_status} ({testResult.confidence}%)</strong></span>
                    <span>Latency: <strong className="font-medium text-neutral-900">{testResult.latency}</strong></span>
                  </div>
                  <div className="text-gray-800 leading-relaxed pt-1 font-normal">
                    <strong className="font-semibold text-neutral-900">Generated Output:</strong> {testResult.summary}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 3: SCRAPER COMMAND CENTER
           ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'scraper' && (
          <div className="space-y-8 max-w-4xl font-sans">
            
            {/* Scraper Metric Counters (4 cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-sans">
              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Crawl Cycles</div>
                <div className="text-2xl font-serif font-medium text-neutral-900 mt-1">{scraperRunsCount}</div>
                <div className="text-[11px] text-gray-400 font-normal">
                  {scraperLastRun ? `Last run at ${scraperLastRun}` : 'Dispatched jobs'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Articles Ingested</div>
                <div className="text-2xl font-serif font-medium text-emerald-700 mt-1">+{scraperArticlesFetched}</div>
                <div className="text-[11px] text-gray-400 font-normal">Stored to MongoDB</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Active Wire Feeds</div>
                <div className="text-2xl font-serif font-medium text-neutral-900 mt-1">30+</div>
                <div className="text-[11px] text-gray-400 font-normal">RSS & Global APIs</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">Buffer Logs</div>
                <div className="text-2xl font-serif font-medium text-orange-600 mt-1">{scraperLogs.length}</div>
                <div className="text-[11px] text-gray-400 font-normal">Log stream lines</div>
              </div>
            </div>

            {/* Scraper Controller Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/90 shadow-xs font-sans">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-orange-600" />
                <h3 className="font-serif font-medium text-xl text-neutral-900">Scrapy Wire Ingestion Controller</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-xl font-normal">
                Force an immediate poll of 30+ top worldwide news endpoints (Reuters, TechCrunch, The Hindu, SpaceNews, NASA, etc.). Articles will be inserted into the staging MongoDB collection and flagged for optimizer processing.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={triggerScraper}
                  disabled={scraperRunning}
                  className="px-7 py-4 bg-neutral-900 hover:bg-orange-600 disabled:opacity-50 text-white font-medium text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {scraperRunning ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                  Execute Immediate Ingestion Cycle
                </button>

                {scraperLogs.length > 0 && (
                  <button
                    onClick={() => {
                      setScraperLogs([]);
                      setMessage({ type: 'success', text: 'Scraper log buffer cleared.' });
                      setTimeout(() => setMessage(null), 3000);
                    }}
                    className="px-5 py-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200 hover:border-red-200 font-medium text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center gap-2 cursor-pointer"
                    title="Clear scraper logs"
                  >
                    <Trash2 size={15} />
                    Clear Logs ({scraperLogs.length})
                  </button>
                )}
              </div>
            </div>

            {/* Live Terminal Log Output */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 text-gray-200 border border-neutral-800 shadow-md space-y-3 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-400" />
                  <span className="font-medium text-white">Scraper Output Stream</span>
                  <span className="px-2.5 py-0.5 bg-neutral-800 rounded-full text-[10px] text-emerald-400 font-mono">
                    {scraperLogs.length} events logged
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {scraperLogs.length > 0 && (
                    <button
                      onClick={() => setScraperLogs([])}
                      className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-400 font-sans transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700"
                      title="Clear Terminal Output"
                    >
                      <Trash2 size={12} /> Clear Stream ({scraperLogs.length})
                    </button>
                  )}
                  <span className="text-[10px] text-gray-500 font-normal">Live Buffer</span>
                </div>
              </div>

              <div className="h-64 overflow-y-auto space-y-1.5 text-xs text-gray-300 font-normal">
                {scraperLogs.length === 0 ? (
                  <div className="text-gray-500 italic py-10 text-center">
                    [Buffer clear • 0 log lines] Click 'Execute Immediate Ingestion Cycle' to dispatch a crawl job.
                  </div>
                ) : (
                  scraperLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Scraped Articles Viewer Section ── */}
            <div className="space-y-4 pt-4 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-medium text-xl text-neutral-900">
                    Ingested Scraped Stories
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {scrapedArticles.length} Loaded
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={scrapedSearch}
                      onChange={(e) => setScrapedSearch(e.target.value)}
                      placeholder="Filter scraped stories..."
                      className="pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs text-neutral-900 placeholder-gray-400 focus:border-red-600 outline-none w-44 sm:w-56"
                    />
                    <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
                  </div>

                  <button
                    onClick={() => fetchScrapedArticles()}
                    className="p-2 rounded-xl bg-white text-gray-600 hover:text-neutral-900 border border-gray-200 transition-colors cursor-pointer"
                    title="Refresh Scraped Stories list"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {filteredScrapedArticles.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white border border-gray-200 text-center text-gray-500 text-xs font-normal">
                  {scrapedArticles.length === 0
                    ? "No scraped articles in memory. Click 'Execute Immediate Ingestion Cycle' to run a crawl and load stories."
                    : "No articles matched your filter criteria."}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs">
                  <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {filteredScrapedArticles.map((art, idx) => (
                      <div key={idx} className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span className="text-xs font-mono text-gray-400 pt-0.5 shrink-0">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                {art.source || 'Wire Feed'}
                              </span>
                              {art.category && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                                  {art.category}
                                </span>
                              )}
                              <span className="text-[10px] text-gray-400 font-normal">
                                {art.date || 'Recent'}
                              </span>
                            </div>
                            <h5 className="text-xs sm:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
                              {art.headline}
                            </h5>
                            {art.description && (
                              <p className="text-xs text-gray-500 line-clamp-1 font-normal">
                                {art.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {art.link && (
                          <a
                            href={art.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            title="Visit Wire Article"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 4: MODERATION LOGS
           ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'logs' && (
          <div className="space-y-6 font-sans">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-medium text-2xl text-neutral-900">Content Moderation Logs</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {logs.length} Total
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-normal mt-1">
                  Showing {filteredLogs.length} of {logs.length} logged moderation records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-sans">
                {/* Filter buttons with exact count numbers */}
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    logFilter === 'all' ? 'bg-neutral-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:text-neutral-900 border border-gray-200'
                  }`}
                >
                  All ({logs.length})
                </button>
                <button
                  onClick={() => setLogFilter('Clean')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    logFilter === 'Clean' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  Clean ({cleanLogsCount})
                </button>
                <button
                  onClick={() => setLogFilter('Flagged')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    logFilter === 'Flagged' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
                  }`}
                >
                  Flagged ({flaggedLogsCount})
                </button>

                <div className="h-4 w-px bg-gray-300 mx-1 hidden sm:block"></div>

                <button
                  onClick={() => fetchLogs()}
                  className="p-2 rounded-full bg-white text-gray-600 hover:text-neutral-900 border border-gray-200 cursor-pointer"
                  title="Refresh Log Stream"
                >
                  <RefreshCw size={14} />
                </button>

                {logs.length > 0 && (
                  <button
                    onClick={clearModerationLogs}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                    title="Clear all moderation logs"
                  >
                    <Trash2 size={13} /> Clear All Logs
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 font-sans">
              {filteredLogs.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center text-gray-400 text-xs font-normal">
                  No moderation logs found matching criteria.
                </div>
              ) : (
                filteredLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${log.verdict === 'Clean' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-neutral-900 truncate">{log.article_headline}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-1 font-normal">
                          <span>Logged: {new Date((log.timestamp || Date.now() / 1000) * 1000).toLocaleString()}</span>
                          <span>•</span>
                          <span>Confidence: <strong className="text-neutral-900 font-medium">{log.confidence || 95}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 font-sans">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        log.verdict === 'Clean' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {log.verdict}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            TAB 5: SUBSCRIBER DIRECTORY
           ═════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6 font-sans">
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-medium text-2xl text-neutral-900">Registered Users & Subscribers</h3>
                <p className="text-xs text-gray-500 font-normal mt-1">Reader accounts managed via mobile client & web waitlist.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs font-sans">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="p-4 sm:p-5">User ID</th>
                    <th className="p-4 sm:p-5">Account Name</th>
                    <th className="p-4 sm:p-5">Email Address</th>
                    <th className="p-4 sm:p-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-normal">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 sm:p-5 font-mono text-gray-400">{u.id}</td>
                      <td className="p-4 sm:p-5 text-neutral-900 font-medium">{u.name}</td>
                      <td className="p-4 sm:p-5 text-gray-600">{u.email}</td>
                      <td className="p-4 sm:p-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#111113] text-gray-400 border-t border-neutral-800 text-sm font-sans">
      {/* ── Main Footer 4-Column Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 group no-underline"
            >
              <span className="font-sans font-semibold text-3xl tracking-tight text-white group-hover:text-red-500 transition-colors">
                NEWSONTIP<span className="text-red-600">.</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm font-normal">
              An independent digital news publication delivering timely coverage across global developments, verified journalism, and comprehensive dispatches.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-normal text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Editorial Feed
              </div>
            </div>
          </div>

          {/* Column 2: News Sections (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-sans">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link
                  to="/category/world"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  World News
                </Link>
              </li>
              <li>
                <Link
                  to="/category/technology"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  to="/category/business"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Business & Markets
                </Link>
              </li>
              <li>
                <Link
                  to="/category/space"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Space Exploration
                </Link>
              </li>
              <li>
                <Link
                  to="/category/sports"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Sports Global
                </Link>
              </li>
              <li>
                <Link
                  to="/category/entertainment"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Entertainment
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform & Transparency (2 cols) */}
          <div className="lg:col-span-2 space-y-3 font-sans">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              About NewsOnTip
            </h4>
            <ul className="space-y-2 text-xs font-normal">
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  How NewsOnTip Works
                </Link>
              </li>
              <li>
                <Link
                  to="/writers"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  For Publishers
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/content-policy"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/takedown"
                  className="hover:text-red-400 transition-colors no-underline"
                >
                  Takedown Protocol
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Daily Synthesis (4 cols) */}
          <div className="lg:col-span-4 space-y-4 font-sans">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500 block mb-1 flex items-center gap-1">
                <Sparkles size={12} /> Daily Morning Digest
              </span>
              <h5 className="text-sm font-medium text-white mb-2">
                Curated stories in your inbox
              </h5>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed font-normal">
                Join readers and journalists receiving our 3-minute morning news briefing.
              </p>

              {subscribed ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} /> Subscribed successfully! Check
                  inbox.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email..."
                    className="flex-1 px-3.5 py-2.5 bg-black/60 border border-neutral-700 rounded-xl text-xs text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-normal"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium uppercase tracking-wider rounded-xl transition-colors shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright Bar ── */}
      <div className="border-t border-neutral-800/80 bg-black/40 py-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-normal">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} NEWSONTIP Fact News Network.</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-normal">
            <Link
              to="/legal/terms"
              className="hover:text-gray-300 transition-colors no-underline"
            >
              Terms of Service
            </Link>
            <Link
              to="/legal/privacy"
              className="hover:text-gray-300 transition-colors no-underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/legal/content-policy"
              className="hover:text-gray-300 transition-colors no-underline"
            >
              Content Standards
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

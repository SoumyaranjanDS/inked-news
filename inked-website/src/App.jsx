import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Writers from "./pages/Writers";
import HowItWorks from "./pages/HowItWorks";
import Blog from "./pages/Blog";
import LegalTerms from "./pages/legal/Terms";
import LegalPrivacy from "./pages/legal/Privacy";
import LegalContentPolicy from "./pages/legal/ContentPolicy";
import LegalTakedown from "./pages/legal/Takedown";
import ArticleDetail from "./pages/ArticleDetail";
import Category from "./pages/Category";
import ScrollToTop from "./components/ScrollToTop";
import AdminDashboard from "./pages/AdminDashboard";
import { Agentation } from "agentation";

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("inked-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("inked-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={<Home theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/category/:id"
          element={<Category theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/article"
          element={<ArticleDetail theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/article/:title"
          element={<ArticleDetail theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/writers"
          element={<Writers theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/how-it-works"
          element={<HowItWorks theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/blog"
          element={<Blog theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/legal/terms"
          element={<LegalTerms theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/legal/privacy"
          element={<LegalPrivacy theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route
          path="/legal/content-policy"
          element={
            <LegalContentPolicy theme={theme} toggleTheme={toggleTheme} />
          }
        />
        <Route
          path="/legal/takedown"
          element={<LegalTakedown theme={theme} toggleTheme={toggleTheme} />}
        />
        <Route path="/admin" element={<AdminDashboard theme={theme} />} />
      </Routes>
      {import.meta.env.DEV && <Agentation />}
    </>
  );
}

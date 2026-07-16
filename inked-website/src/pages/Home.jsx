import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MessageSquare } from 'lucide-react'
import Masthead from '../components/Masthead'
import Footer from '../components/Footer'

// Map sources to colors (mock categories)
const CATEGORY_MAP = {
  'The Hindu': 'ENTERTAINMENT',
  'Reuters': 'BUSINESS',
  'TechCrunch': 'TECHNOLOGY',
  'DEFAULT': 'LIFESTYLE'
}

export default function Home({ theme, toggleTheme }) {
  const [articles, setArticles] = useState([])
  const [isLoadingFeed, setIsLoadingFeed] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [feedError, setFeedError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => { fetchFeed(1) }, [])

  const fetchFeed = async (pageNum, append = false) => {
    if (!append) setIsLoadingFeed(true)
    else setIsLoadingMore(true)
    
    setFeedError(null)
    try {
      const res = await fetch(`http://localhost:5000/api/feed?limit=30&page=${pageNum}`)
      const data = await res.json()
      if (data.success) {
        if (data.data.length < 30) setHasMore(false)
        if (append) {
          setArticles(prev => [...prev, ...data.data])
        } else {
          setArticles(data.data)
        }
      } else throw new Error(data.error)
    } catch (err) {
      setFeedError(err.message)
    } finally {
      setIsLoadingFeed(false)
      setIsLoadingMore(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section style={{ background: '#f5f5f5', padding: '5rem 0', textAlign: 'center', borderBottom: '1px solid var(--rule-gray)' }}>
        <div className="container">
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {/* Play button icon placeholder */}
            <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '16px solid var(--masthead-red)' }}></div>
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Latest News & Article
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 600 }}>Archives</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section" style={{ flex: 1 }}>
        <div className="container">
          {feedError && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', padding: '1rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
              ⚠ {feedError}
            </div>
          )}

          {isLoadingFeed ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ border: '1px solid var(--rule-gray)', opacity: 0.6, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                  <div style={{ width: '100%', height: '220px', background: 'var(--rule-gray)' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ width: '90%', height: '24px', background: 'var(--rule-gray)', marginBottom: '1rem' }} />
                    <div style={{ width: '100%', height: '16px', background: 'var(--rule-gray)', marginBottom: '0.5rem' }} />
                    <div style={{ width: '80%', height: '16px', background: 'var(--rule-gray)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--text)' }}>No articles found.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {articles.map((article, i) => {
                  const category = CATEGORY_MAP[article.source] || CATEGORY_MAP['DEFAULT']
                  return (
                    <div key={i} style={{ border: '1px solid var(--rule-gray)', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                      {/* Image container */}
                      <div style={{ position: 'relative', height: '220px', backgroundColor: '#eaeaea', overflow: 'hidden' }}>
                        {article.image_link ? (
                          <img src={article.image_link} alt={article.headline} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                        ) : null}
                        <div className="badge" style={{ position: 'absolute', top: 0, right: 0 }}>
                          {category}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Link to={`/article`} state={{ article }} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.3, marginBottom: '1rem', color: 'var(--text)' }}>
                            {article.headline}
                          </h3>
                        </Link>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {article.summary || article.description || "Sem ultricies laoreet iaculis cras mattis sollicitudin tristique. Turpis scelerisque vitae phasellus nisl pretium. Urna tempor vehicula nascetur efficitur euismod feugiat elementum mollis iaculis suscipit"}
                        </p>
                        
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--rule-gray)', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {article.date || "July 16, 2023"}
                          </span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            No Comments
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <button onClick={loadMore} disabled={isLoadingMore} className="btn-primary" style={{ padding: '0.8rem 2rem', opacity: isLoadingMore ? 0.7 : 1 }}>
                    {isLoadingMore ? 'LOADING...' : 'LOAD MORE'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

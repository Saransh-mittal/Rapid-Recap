// ManualSearch.jsx — Compact inline search with results dropdown
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const processSearch = (query, pages) => {
  const terms = query.toLowerCase().split(' ').filter(t => t.length > 0)
  if (!terms.length) return []

  const results = []

  pages.forEach(page => {
    Object.entries(page.content).forEach(([subtitle, items]) => {
      items.forEach(item => {
        const text = item.text || item
        const explanation = item.explanation || ''
        let score = 0

        terms.forEach(term => {
          if (page.title.toLowerCase().includes(term)) score += 3
          if (subtitle.toLowerCase().includes(term)) score += 2
          if (text.toLowerCase().includes(term)) score += 1
          if (explanation.toLowerCase().includes(term)) score += 0.5
        })

        if (score > 0) {
          results.push({
            section: page.title,
            subtitle,
            text,
            explanation,
            score,
            pageId: page.id,
          })
        }
      })
    })
  })

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}

const ManualSearch = ({ pages }) => {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const wrapRef = useRef(null)

  const results = useMemo(() => {
    if (!query || query.length < 2) return []
    return processSearch(query, pages)
  }, [query, pages])

  const showResults = focused && query.length >= 2

  const handleSelect = useCallback((pageId) => {
    navigate(`/manual/${pageId}`)
    setQuery('')
    setFocused(false)
  }, [navigate])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="manual-search-wrap" ref={wrapRef}>
      <input
        className="manual-search-input"
        placeholder="Search topics..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
      />
      <Search size={18} className="manual-search-icon" />

      {query && (
        <button
          className="manual-search-clear"
          onClick={() => { setQuery(''); setFocused(false) }}
        >
          <X size={16} />
        </button>
      )}

      {showResults && (
        <div className="manual-search-results manual-animate-fade-in">
          {results.length > 0 ? (
            results.map((r, i) => (
              <div
                key={`${r.pageId}-${r.text}-${i}`}
                className="manual-search-result-item"
                onClick={() => handleSelect(r.pageId)}
              >
                <div className="manual-search-result-section">{r.section}</div>
                <div className="manual-search-result-title">{r.text}</div>
                {r.explanation && (
                  <div className="manual-search-result-preview">{r.explanation}</div>
                )}
              </div>
            ))
          ) : (
            <div className="manual-search-empty">
              No results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(ManualSearch)

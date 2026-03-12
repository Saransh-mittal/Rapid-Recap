// RuleBook.jsx — Quick Clash V2 Manual
// Single-scroll accordion. All topics on one page. Zero navigation duplication.
// Inline styles matching PlayLanding.jsx / QC V2 conventions.

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, ChevronRight } from 'lucide-react'
import { getRuleBookPages } from '../assets/ruleBookData'

// ─── Theme (matches PlayLanding.jsx) ─────────────────────────────────────────
const t = {
  bg: 'rgba(15, 23, 42, 0.5)',
  bgHover: 'rgba(15, 23, 42, 0.65)',
  bgSolid: 'rgba(15, 23, 42, 0.8)',
  cyan: '#22d3ee',
  cyanDim: 'rgba(34, 211, 238, 0.12)',
  cyanGlow: 'rgba(34, 211, 238, 0.25)',
  blue: '#0ea5e9',
  border: 'rgba(255, 255, 255, 0.07)',
  borderHover: 'rgba(255, 255, 255, 0.14)',
  text: '#ffffff',
  text2: 'rgba(255, 255, 255, 0.65)',
  text3: 'rgba(255, 255, 255, 0.38)',
  font: "'Sora', system-ui, -apple-system, sans-serif",
  r: 12,
}

// ─── Framer variants ─────────────────────────────────────────────────────────
const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25, delay: 0.1 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.15 } } },
}

const itemExpandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2, delay: 0.05 } } },
  exit: { height: 0, opacity: 0, transition: { height: { duration: 0.2 }, opacity: { duration: 0.1 } } },
}

// ─── Search helpers ──────────────────────────────────────────────────────────
const searchPages = (query, pages) => {
  const terms = query.toLowerCase().split(' ').filter(x => x.length > 0)
  if (!terms.length) return []
  const results = []
  pages.forEach(page => {
    Object.entries(page.content).forEach(([subtitle, items]) => {
      items.forEach(item => {
        const text = (item.text || '').toLowerCase()
        const exp = (item.explanation || '').toLowerCase()
        let score = 0
        terms.forEach(term => {
          if (page.title.toLowerCase().includes(term)) score += 3
          if (subtitle.toLowerCase().includes(term)) score += 2
          if (text.includes(term)) score += 1
          if (exp.includes(term)) score += 0.5
        })
        if (score > 0) results.push({ pageId: page.id, section: page.title, subtitle, text: item.text, score })
      })
    })
  })
  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}

// ═══════════════════════════════════════════════════════════════════════════════
// ContentItem — single expandable rule
// ═══════════════════════════════════════════════════════════════════════════════
const ContentItem = React.memo(({ item, pages, onNavigate }) => {
  const [open, setOpen] = useState(false)
  const clickable = item.hasDetails

  return (
    <div
      style={{
        ...s.item,
        ...(open ? s.itemOpen : {}),
        cursor: clickable ? 'pointer' : 'default',
      }}
      onClick={() => clickable && setOpen(v => !v)}
    >
      <div style={s.itemHeader}>
        <span style={s.itemTitle}>{item.text}</span>
        {clickable && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
            <ChevronDown size={16} color={open ? t.cyan : t.text3} />
          </motion.div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && clickable && (
          <motion.div
            key="body"
            variants={itemExpandVariants}
            initial="collapsed"
            animate="expanded"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <div style={s.itemBodyWrap}>
              <p style={s.itemExplanation}>{item.explanation}</p>
              
              {item.relatedTopics && item.relatedTopics.length > 0 && (
                <div style={s.relatedTopicsWrap}>
                  <div style={s.relatedTopicsLabel}>Related Topics:</div>
                  <div style={s.relatedTopicsList}>
                    {item.relatedTopics.map(topicId => {
                      const targetPage = pages.find(p => p.id === topicId)
                      if (!targetPage) return null
                      return (
                        <button
                          key={topicId}
                          style={s.relatedTopicBtn}
                          onClick={() => onNavigate(topicId)}
                        >
                          {targetPage.title}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// TopicSection — a single collapsible topic (accordion item)
// ═══════════════════════════════════════════════════════════════════════════════
const TopicSection = React.memo(({ page, isOpen, onToggle, sectionRef, pages, onNavigate }) => {
  const sections = Object.entries(page.content)

  return (
    <div ref={sectionRef} style={s.topic}>
      {/* Topic Header */}
      <div
        style={{ ...s.topicHeader, ...(isOpen ? s.topicHeaderOpen : {}) }}
        onClick={onToggle}
      >
        <div style={s.topicHeaderLeft}>
          <div style={{ ...s.topicDot, ...(isOpen ? s.topicDotOpen : {}) }} />
          <span style={{ ...s.topicTitle, ...(isOpen ? s.topicTitleOpen : {}) }}>{page.title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronRight size={18} color={isOpen ? t.cyan : t.text3} />
        </motion.div>
      </div>

      {/* Topic Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="exit"
            style={{ overflow: 'hidden' }}
          >
            <div style={s.topicBody}>
              {sections.map(([subtitle, items], idx) => (
                <div key={subtitle} style={s.sectionBlock}>
                  <div style={s.sectionHeader}>
                    <span style={s.sectionNumber}>{idx + 1}</span>
                    <span style={s.sectionName}>{subtitle}</span>
                  </div>
                  {items.map((item, i) => (
                    <ContentItem key={`${subtitle}-${i}`} item={item} pages={pages} onNavigate={onNavigate} />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// SearchOverlay
// ═══════════════════════════════════════════════════════════════════════════════
const SearchOverlay = React.memo(({ pages, onSelect, searchQuery, setSearchQuery, isActive, setIsActive }) => {
  const inputRef = useRef(null)
  const wrapRef = useRef(null)

  const results = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    return searchPages(searchQuery, pages)
  }, [searchQuery, pages])

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsActive(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setIsActive])

  const showResults = isActive && searchQuery.length >= 2

  return (
    <div ref={wrapRef} style={s.searchWrap}>
      <div style={s.searchIconWrap}>
        <Search size={16} color={isActive ? t.cyan : t.text3} />
      </div>
      <input
        ref={inputRef}
        style={{
          ...s.searchInput,
          ...(isActive ? s.searchInputFocus : {}),
        }}
        placeholder="Search rules..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        onFocus={() => setIsActive(true)}
      />
      {searchQuery && (
        <button style={s.searchClear} onClick={() => { setSearchQuery(''); inputRef.current?.focus() }}>
          <X size={14} color={t.text3} />
        </button>
      )}

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={s.searchResults}
          >
            {results.length > 0 ? results.map((r, i) => (
              <div
                key={`${r.pageId}-${r.text}-${i}`}
                style={s.searchResultItem}
                onClick={() => { onSelect(r.pageId); setSearchQuery(''); setIsActive(false) }}
                onMouseEnter={e => { e.currentTarget.style.background = t.cyanDim }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <div style={s.searchResultSection}>{r.section} → {r.subtitle}</div>
                <div style={s.searchResultTitle}>{r.text}</div>
              </div>
            )) : (
              <div style={s.searchEmpty}>No results for "{searchQuery}"</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════
// RuleBook — Main component
// ═══════════════════════════════════════════════════════════════════════════════
const RuleBook = () => {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const pages = useMemo(() => getRuleBookPages(), [])
  const sectionRefs = useRef({})

  // Accordion state — which topic is open
  const [openTopicId, setOpenTopicId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const mountedRef = useRef(false)

  // ONLY on mount: expand the matching topic from the URL
  useEffect(() => {
    if (mountedRef.current) return // skip after mount
    mountedRef.current = true

    const targetId = pageId && pages.find(p => p.id === pageId) ? pageId : pages[0].id
    setOpenTopicId(targetId)

    if (!pageId || !pages.find(p => p.id === pageId)) {
      navigate(`/manual/${pages[0].id}`, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle accordion — update URL silently (no navigate, no re-render)
  const handleToggle = useCallback((id) => {
    setOpenTopicId(prev => {
      const newId = prev === id ? null : id
      if (newId) window.history.replaceState(null, '', `/manual/${newId}`)
      return newId
    })
  }, [])

  const handleSearchSelect = useCallback((id) => {
    setOpenTopicId(id)
    window.history.replaceState(null, '', `/manual/${id}`)
    setTimeout(() => {
      const ref = sectionRefs.current[id]
      if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  const currentPage = pages.find(p => p.id === openTopicId) || pages[0]

  return (
    <>
      <Helmet>
        <title>{`${currentPage.title} – Quick Clash Manual | Rapid Recap`}</title>
        <meta name="description" content={`Official Quick Clash V2 manual — ${currentPage.title}. Master rules, mechanics, powerups, and strategy.`} />
      </Helmet>

      {/* Google Font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={s.page}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={s.header}
        >
          <p style={s.subtitle}>Quick Clash V2</p>
          <h1 style={s.title}>Manual</h1>
        </motion.div>

        {/* Search */}
        <SearchOverlay
          pages={pages}
          onSelect={handleSearchSelect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isActive={searchActive}
          setIsActive={setSearchActive}
        />

        {/* Topic count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={s.topicCount}
        >
          {pages.length} topics
        </motion.p>

        {/* Accordion */}
        <div style={s.accordion}>
          {pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.35 }}
            >
              <TopicSection
                page={page}
                isOpen={openTopicId === page.id}
                onToggle={() => handleToggle(page.id)}
                sectionRef={el => { sectionRefs.current[page.id] = el }}
                pages={pages}
                onNavigate={handleSearchSelect}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Styles (inline, matching PlayLanding.jsx conventions)
// ═══════════════════════════════════════════════════════════════════════════════
const s = {
  // Page
  page: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    maxWidth: 680,
    margin: '0 auto',
    padding: '16px 16px 60px',
    fontFamily: t.font,
    WebkitFontSmoothing: 'antialiased',
  },

  // Header
  header: { marginBottom: 16 },
  subtitle: {
    fontSize: 11,
    fontWeight: 600,
    color: t.text3,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: t.text,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    margin: '2px 0 0',
  },

  // Search
  searchWrap: { position: 'relative', marginBottom: 16 },
  searchIconWrap: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, pointerEvents: 'none', display: 'flex' },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 36px 10px 36px',
    background: t.bg,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${t.border}`,
    borderRadius: t.r,
    color: t.text,
    fontFamily: t.font,
    fontSize: 13,
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  searchInputFocus: {
    borderColor: t.cyan,
    boxShadow: `0 0 0 3px ${t.cyanDim}`,
  },
  searchClear: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex',
  },
  searchResults: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    background: t.bgSolid, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${t.borderHover}`, borderRadius: t.r,
    padding: 6, zIndex: 50, maxHeight: 280, overflowY: 'auto',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
  },
  searchResultItem: {
    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.12s',
  },
  searchResultSection: {
    fontSize: 10, fontWeight: 700, color: t.cyan, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1,
  },
  searchResultTitle: { fontSize: 13, fontWeight: 600, color: t.text },
  searchEmpty: { padding: 20, textAlign: 'center', color: t.text3, fontSize: 13 },

  // Topic count
  topicCount: { fontSize: 11, color: t.text3, margin: '0 0 10px', fontWeight: 500 },

  // Accordion
  accordion: { display: 'flex', flexDirection: 'column', gap: 6 },

  // Topic
  topic: {
    borderRadius: t.r,
    border: `1px solid ${t.border}`,
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },

  // Topic Header
  topicHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    background: t.bg,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'background 0.2s',
  },
  topicHeaderOpen: {
    background: t.bgHover,
    borderBottom: `1px solid ${t.border}`,
  },
  topicHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  topicDot: {
    width: 8, height: 8, borderRadius: '50%', background: t.text3, flexShrink: 0, transition: 'all 0.25s',
  },
  topicDotOpen: {
    background: t.cyan, boxShadow: `0 0 8px ${t.cyanGlow}`,
  },
  topicTitle: {
    fontSize: 14, fontWeight: 700, color: t.text2, letterSpacing: '-0.01em', transition: 'color 0.2s',
  },
  topicTitleOpen: { color: t.text },

  // Topic Body
  topicBody: { padding: '12px 16px 16px' },

  // Section Block
  sectionBlock: { marginBottom: 20 },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionNumber: {
    width: 22, height: 22, borderRadius: 6,
    background: `linear-gradient(135deg, ${t.cyan}, ${t.blue})`,
    color: '#0a1628', fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sectionName: { fontSize: 13, fontWeight: 700, color: t.text, letterSpacing: '-0.01em' },

  // Content Item
  item: {
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: t.r,
    marginBottom: 5,
    overflow: 'hidden',
    transition: 'border-color 0.2s, background 0.2s',
  },
  itemOpen: {
    borderColor: t.cyanGlow,
    background: t.bgHover,
  },
  itemHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 14px', gap: 10,
    WebkitTapHighlightColor: 'transparent',
  },
  itemTitle: { fontSize: 13, fontWeight: 600, color: t.text, flex: 1, lineHeight: 1.4 },
  itemExplanation: {
    fontSize: 12.5, color: t.text2, lineHeight: 1.7, margin: 0,
    padding: '0 14px 12px',
  },
  
  // Related Topics
  itemBodyWrap: {
    borderTop: `1px solid ${t.border}`,
    paddingTop: 10,
  },
  relatedTopicsWrap: {
    padding: '0 14px 12px',
    marginTop: -4,
  },
  relatedTopicsLabel: {
    fontSize: 10, fontWeight: 700, color: t.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
  },
  relatedTopicsList: {
    display: 'flex', flexWrap: 'wrap', gap: 6,
  },
  relatedTopicBtn: {
    background: t.bgHover,
    border: `1px solid ${t.borderHover}`,
    color: t.cyan,
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
}

export default RuleBook

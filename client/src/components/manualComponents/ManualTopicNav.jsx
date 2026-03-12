// ManualTopicNav.jsx — Horizontal scrollable chips (mobile) + vertical sticky list (desktop)
import React, { useRef, useEffect } from 'react'

const ManualTopicNav = ({ pages, currentPageId, onSelect }) => {
  const navRef = useRef(null)

  // Auto-scroll active chip into view on mobile
  useEffect(() => {
    if (!navRef.current) return
    const activeChip = navRef.current.querySelector('.manual-topic-chip.active')
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [currentPageId])

  return (
    <nav className="manual-topic-nav" ref={navRef}>
      {pages.map(page => (
        <button
          key={page.id}
          className={`manual-topic-chip${currentPageId === page.id ? ' active' : ''}`}
          onClick={() => onSelect(page.id)}
        >
          {page.title}
        </button>
      ))}
    </nav>
  )
}

export default React.memo(ManualTopicNav)

// ManualContent.jsx — Content cards with smooth expand/collapse
import React, { useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'

const ManualItem = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false)

  const toggle = useCallback(() => {
    if (item.hasDetails) setExpanded(prev => !prev)
  }, [item.hasDetails])

  return (
    <div className={`manual-item${expanded ? ' expanded' : ''}`}>
      <div className="manual-item-header" onClick={toggle}>
        <span className="manual-item-title">{item.text}</span>
        {item.hasDetails && (
          <ChevronDown size={16} className="manual-item-chevron" />
        )}
      </div>

      {/* CSS grid transition for smooth height animation */}
      {item.hasDetails && (
        <div className="manual-item-body-wrapper">
          <div className="manual-item-body">
            <p className="manual-item-explanation">{item.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const ManualContent = ({ page }) => {
  if (!page) return null

  const sections = Object.entries(page.content)
  let counter = 0

  return (
    <div className="manual-content-area" key={page.id}>
      <h2 className="manual-page-title">{page.title}</h2>

      {sections.map(([subtitle, items]) => {
        counter++
        return (
          <div key={subtitle} className="manual-section">
            <div className="manual-section-header">
              <span className="manual-section-number">{counter}</span>
              <span className="manual-section-name">{subtitle}</span>
            </div>

            {items.map((item, i) => (
              <ManualItem key={`${subtitle}-${i}`} item={item} index={i} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(ManualContent)

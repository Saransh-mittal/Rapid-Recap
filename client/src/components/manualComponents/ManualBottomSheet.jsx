// ManualBottomSheet.jsx — Mobile-only bottom sheet for topic selection
import React from 'react'
import { createPortal } from 'react-dom'

const ManualBottomSheet = ({ pages, currentPageId, onSelect, isOpen, onClose }) => {
  if (!isOpen) return null

  return createPortal(
    <>
      <div
        className="manual-sheet-backdrop manual-animate-fade-in"
        onClick={onClose}
      />
      <div className="manual-sheet manual-animate-slide-up">
        <div className="manual-sheet-handle" />
        <div className="manual-sheet-title">Topics</div>

        {pages.map(page => (
          <div
            key={page.id}
            className={`manual-sheet-item${currentPageId === page.id ? ' active' : ''}`}
            onClick={() => { onSelect(page.id); onClose() }}
          >
            <span className="manual-sheet-item-dot" />
            <span className="manual-sheet-item-label">{page.title}</span>
          </div>
        ))}
      </div>
    </>,
    document.body
  )
}

export default React.memo(ManualBottomSheet)

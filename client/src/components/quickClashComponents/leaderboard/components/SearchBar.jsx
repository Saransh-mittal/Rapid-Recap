// components/quickClashComponents/leaderboard/components/SearchBar.jsx
import React, { memo } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SearchBar = memo(({ searchQuery, setSearchQuery, handleClearSearch }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <div className="px-4 py-3 border-b border-white/5 relative z-10">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-3.5 h-3.5 text-white/50" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder={t('Search players...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-9 pr-9 bg-slate-900/60 border border-white/10 rounded-full text-sm text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:bg-slate-900/90 focus:ring-1 focus:ring-amber-500/50 transition-all"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
})

SearchBar.displayName = 'SearchBar'

export default SearchBar

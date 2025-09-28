// src/components/WiseWeb/components/LoadingComponents.jsx - Enhanced loading states
import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { QUICK_CLASH_CLASSES } from '../../quickClashComponents/utils/quickClashColors'

// Enhanced shimmer animation
const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
}

// Base shimmer component
const Shimmer = memo(({ className = '', children, ...props }) => (
  <div className={`relative overflow-hidden ${className}`} {...props}>
    {children}
    <motion.div
      variants={shimmerVariants}
      initial="initial"
      animate="animate"
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      style={{ width: '100%' }}
    />
  </div>
))

// Friend card skeleton with enhanced animations
export const FriendCardSkeleton = memo(({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className={`${QUICK_CLASH_CLASSES.glassLight} rounded-xl p-4`}
  >
    <div className="flex items-center space-x-3">
      {/* Avatar skeleton */}
      <Shimmer className="w-12 h-12 bg-cyan-500/20 rounded-full">
        <div className="w-full h-full bg-cyan-400/30 rounded-full" />
      </Shimmer>

      {/* Info skeleton */}
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 bg-cyan-400/20 rounded w-3/4">
          <div className="w-full h-full bg-cyan-400/30 rounded" />
        </Shimmer>
        <Shimmer className="h-3 bg-blue-400/20 rounded w-1/2">
          <div className="w-full h-full bg-blue-400/30 rounded" />
        </Shimmer>
        <div className="flex items-center gap-4">
          <Shimmer className="h-3 bg-yellow-400/20 rounded w-12">
            <div className="w-full h-full bg-yellow-400/30 rounded" />
          </Shimmer>
          <Shimmer className="h-3 bg-slate-400/20 rounded w-16">
            <div className="w-full h-full bg-slate-400/30 rounded" />
          </Shimmer>
        </div>
      </div>

      {/* Action button skeleton */}
      <Shimmer className="w-8 h-8 bg-cyan-500/20 rounded">
        <div className="w-full h-full bg-cyan-500/30 rounded" />
      </Shimmer>
    </div>
  </motion.div>
))

// Friend request skeleton
export const FriendRequestSkeleton = memo(({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className={`${QUICK_CLASH_CLASSES.glassLight} rounded-xl p-4`}
  >
    <div className="flex items-center space-x-3 mb-3">
      {/* Avatar with notification indicator */}
      <div className="relative">
        <Shimmer className="w-12 h-12 bg-cyan-500/20 rounded-full">
          <div className="w-full h-full bg-cyan-400/30 rounded-full" />
        </Shimmer>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500/50 rounded-full" />
      </div>

      {/* User info */}
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 bg-cyan-400/20 rounded w-2/3">
          <div className="w-full h-full bg-cyan-400/30 rounded" />
        </Shimmer>
        <Shimmer className="h-3 bg-blue-400/20 rounded w-1/2">
          <div className="w-full h-full bg-blue-400/30 rounded" />
        </Shimmer>
        <div className="flex items-center gap-4">
          <Shimmer className="h-3 bg-yellow-400/20 rounded w-10">
            <div className="w-full h-full bg-yellow-400/30 rounded" />
          </Shimmer>
          <Shimmer className="h-3 bg-slate-400/20 rounded w-14">
            <div className="w-full h-full bg-slate-400/30 rounded" />
          </Shimmer>
        </div>
      </div>
    </div>

    {/* Action buttons */}
    <div className="flex gap-2">
      <Shimmer className="flex-1 h-10 bg-green-500/20 rounded-lg">
        <div className="w-full h-full bg-green-500/30 rounded-lg" />
      </Shimmer>
      <Shimmer className="flex-1 h-10 bg-red-500/20 rounded-lg">
        <div className="w-full h-full bg-red-500/30 rounded-lg" />
      </Shimmer>
    </div>
  </motion.div>
))

// Search result skeleton
export const SearchResultSkeleton = memo(({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className={`${QUICK_CLASH_CLASSES.glassLight} rounded-xl p-4`}
  >
    <div className="flex items-center space-x-3">
      {/* Avatar with possible online indicator */}
      <div className="relative">
        <Shimmer className="w-12 h-12 bg-cyan-500/20 rounded-full">
          <div className="w-full h-full bg-cyan-400/30 rounded-full" />
        </Shimmer>
        {/* Random online indicator for variety */}
        {Math.random() > 0.5 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400/50 rounded-full" />
        )}
      </div>

      {/* User info */}
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 bg-cyan-400/20 rounded w-2/3">
          <div className="w-full h-full bg-cyan-400/30 rounded" />
        </Shimmer>
        <Shimmer className="h-3 bg-blue-400/20 rounded w-1/2">
          <div className="w-full h-full bg-blue-400/30 rounded" />
        </Shimmer>
        <div className="flex items-center gap-4">
          <Shimmer className="h-3 bg-yellow-400/20 rounded w-12">
            <div className="w-full h-full bg-yellow-400/30 rounded" />
          </Shimmer>
          <Shimmer className="h-3 bg-slate-400/20 rounded w-16">
            <div className="w-full h-full bg-slate-400/30 rounded" />
          </Shimmer>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Shimmer className="w-8 h-8 bg-slate-500/20 rounded-lg">
          <div className="w-full h-full bg-slate-500/30 rounded-lg" />
        </Shimmer>
        <Shimmer className="w-20 h-10 bg-cyan-500/20 rounded-lg">
          <div className="w-full h-full bg-cyan-500/30 rounded-lg" />
        </Shimmer>
      </div>
    </div>
  </motion.div>
))

// Multi-skeleton container with staggered animations
export const SkeletonContainer = memo(
  ({
    children,
    count = 3,
    SkeletonComponent = FriendCardSkeleton,
    className = '',
    ...props
  }) => (
    <div className={`space-y-3 ${className}`} {...props}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} index={index} />
      ))}
    </div>
  ),
)

// Loading state for entire sections
export const SectionLoader = memo(
  ({ title, count = 3, SkeletonComponent = FriendCardSkeleton }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Section title skeleton */}
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <Shimmer className="w-2 h-2 bg-cyan-400/50 rounded-full">
            <div className="w-full h-full bg-cyan-400/70 rounded-full" />
          </Shimmer>
          <Shimmer className="h-4 bg-cyan-400/20 rounded w-24">
            <div className="w-full h-full bg-cyan-400/30 rounded" />
          </Shimmer>
        </div>
      )}

      {/* Skeleton items */}
      <SkeletonContainer count={count} SkeletonComponent={SkeletonComponent} />
    </motion.div>
  ),
)

// Header stats skeleton
export const HeaderStatsSkeleton = memo(() => (
  <div className="flex items-center gap-4 text-sm">
    <div className="flex items-center gap-1">
      <Shimmer className="w-4 h-4 bg-cyan-400/30 rounded">
        <div className="w-full h-full bg-cyan-400/50 rounded" />
      </Shimmer>
      <Shimmer className="h-4 bg-cyan-400/20 rounded w-6">
        <div className="w-full h-full bg-cyan-400/30 rounded" />
      </Shimmer>
      <Shimmer className="h-4 bg-slate-400/20 rounded w-12">
        <div className="w-full h-full bg-slate-400/30 rounded" />
      </Shimmer>
    </div>
    <div className="flex items-center gap-1">
      <Shimmer className="w-4 h-4 bg-green-400/30 rounded">
        <div className="w-full h-full bg-green-400/50 rounded" />
      </Shimmer>
      <Shimmer className="h-4 bg-green-400/20 rounded w-4">
        <div className="w-full h-full bg-green-400/30 rounded" />
      </Shimmer>
      <Shimmer className="h-4 bg-slate-400/20 rounded w-10">
        <div className="w-full h-full bg-slate-400/30 rounded" />
      </Shimmer>
    </div>
  </div>
))

// Search input skeleton
export const SearchInputSkeleton = memo(() => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
      <Shimmer className="w-5 h-5 bg-cyan-400/30 rounded">
        <div className="w-full h-full bg-cyan-400/50 rounded" />
      </Shimmer>
    </div>
    <Shimmer
      className={`
      w-full h-12 rounded-lg pl-12 pr-4
      ${QUICK_CLASH_CLASSES.glassMedium} border border-cyan-500/30
    `}
    >
      <div className="w-full h-full bg-cyan-400/20 rounded-lg" />
    </Shimmer>
  </div>
))

// Tab loading skeleton
export const TabSkeleton = memo(() => (
  <div
    className={`
    flex gap-1 p-1 rounded-xl
    ${QUICK_CLASH_CLASSES.glassDark}
    border border-cyan-500/20
  `}
  >
    {[0, 1, 2].map(index => (
      <Shimmer key={index} className="flex-1 h-12 bg-cyan-500/20 rounded-lg">
        <div className="w-full h-full bg-cyan-500/30 rounded-lg" />
      </Shimmer>
    ))}
  </div>
))

// Global loading overlay for critical operations
export const LoadingOverlay = memo(({ message = 'Loading...' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
  >
    <div className="text-center">
      <div className="w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-cyan-300 font-medium">{message}</p>
    </div>
  </motion.div>
))

// Error state component with retry option
export const ErrorState = memo(
  ({
    title = 'Something went wrong',
    description = 'Please try again later',
    onRetry,
    retryText = 'Retry',
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div
        className={`
      w-16 h-16 rounded-full flex items-center justify-center mb-6
      ${QUICK_CLASH_CLASSES.glassMedium}
      bg-gradient-to-br from-red-500/20 to-orange-500/20
      border border-red-500/30
    `}
      >
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-red-300 mb-3">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`
          px-6 py-2 rounded-lg font-medium transition-all duration-200
          ${QUICK_CLASH_CLASSES.btnSecondary}
          hover:scale-105 focus:scale-105
          ${QUICK_CLASH_CLASSES.focusRingCyan}
        `}
        >
          {retryText}
        </button>
      )}
    </motion.div>
  ),
)

// Progressive loading component for lists
export const ProgressiveLoader = memo(
  ({ isLoading, hasMore, onLoadMore, children }) => (
    <div>
      {children}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}
      {!isLoading && hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={onLoadMore}
            className={`
            px-4 py-2 text-sm font-medium text-cyan-400
            hover:text-cyan-300 transition-colors duration-200
          `}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  ),
)

// Set display names for better debugging
FriendCardSkeleton.displayName = 'FriendCardSkeleton'
FriendRequestSkeleton.displayName = 'FriendRequestSkeleton'
SearchResultSkeleton.displayName = 'SearchResultSkeleton'
SkeletonContainer.displayName = 'SkeletonContainer'
SectionLoader.displayName = 'SectionLoader'
HeaderStatsSkeleton.displayName = 'HeaderStatsSkeleton'
SearchInputSkeleton.displayName = 'SearchInputSkeleton'
TabSkeleton.displayName = 'TabSkeleton'
LoadingOverlay.displayName = 'LoadingOverlay'
ErrorState.displayName = 'ErrorState'
ProgressiveLoader.displayName = 'ProgressiveLoader'
Shimmer.displayName = 'Shimmer'

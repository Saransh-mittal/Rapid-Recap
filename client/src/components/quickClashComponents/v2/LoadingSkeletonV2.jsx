// components/quickClashComponents/v2/LoadingSkeletonV2.jsx
// V2 Skeleton Loaders - Premium with shimmer effects

import React, { memo } from 'react'
import { motion } from 'framer-motion'

// ============================================================================
// BASE SKELETON WITH SHIMMER
// ============================================================================

const Skeleton = memo(({ className = '', rounded = 'rounded-lg' }) => (
  <div
    className={`relative overflow-hidden bg-white/10 ${rounded} ${className}`}
  >
    {/* Shimmer effect */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: 'easeInOut',
      }}
    />
  </div>
))
Skeleton.displayName = 'Skeleton'

// Glowing skeleton for important elements
const GlowingSkeleton = memo(({ className = '', rounded = 'rounded-lg', color = 'cyan' }) => {
  const glowConfig = {
    cyan: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    yellow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
    purple: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-white/5 to-white/10 ${rounded} ${glowConfig[color]} ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
})
GlowingSkeleton.displayName = 'GlowingSkeleton'

// ============================================================================
// HEADER SKELETON
// ============================================================================

export const HeaderSkeletonV2 = memo(() => (
  <div className="bg-gradient-to-b from-white/[0.07] to-cyan-500/[0.03] rounded-2xl border border-cyan-500/20 p-4">
    {/* Top Row */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <GlowingSkeleton className="w-12 h-12" rounded="rounded-xl" color="cyan" />
        <div className="space-y-2">
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      <Skeleton className="w-10 h-10" rounded="rounded-full" />
    </div>

    {/* Stats Row */}
    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
      <GlowingSkeleton className="w-24 h-8" rounded="rounded-full" color="cyan" />
      <Skeleton className="w-20 h-8" rounded="rounded-full" />
      <Skeleton className="w-14 h-8" rounded="rounded-full" />
    </div>
  </div>
))
HeaderSkeletonV2.displayName = 'HeaderSkeletonV2'

// ============================================================================
// BATTLE CARD SKELETON
// ============================================================================

export const BattleCardSkeletonV2 = memo(() => (
  <motion.div
    className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="p-4">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        <GlowingSkeleton className="w-24 h-6" rounded="rounded-full" />
        <Skeleton className="w-12 h-4" />
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-between">
        {/* User Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="w-16 h-3" />
          <div className="flex -space-x-2">
            <GlowingSkeleton className="w-8 h-8" rounded="rounded-full" color="cyan" />
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
          </div>
          <Skeleton className="w-6 h-6" />
        </div>

        {/* VS */}
        <Skeleton className="w-8 h-5 mx-3" />

        {/* Opponent Team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="w-16 h-3" />
          <div className="flex -space-x-2">
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
            <Skeleton className="w-8 h-8" rounded="rounded-full" />
          </div>
          <Skeleton className="w-6 h-6" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="flex-1 h-1.5" rounded="rounded-full" />
        <Skeleton className="w-10 h-4" />
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
      <Skeleton className="w-12 h-3" />
      <Skeleton className="w-16 h-4" />
    </div>
  </motion.div>
))
BattleCardSkeletonV2.displayName = 'BattleCardSkeletonV2'

// ============================================================================
// BATTLE LIST SKELETON
// ============================================================================

export const BattleListSkeletonV2 = memo(({ count = 2 }) => (
  <motion.div
    className="bg-gradient-to-b from-white/[0.07] to-cyan-500/[0.03] border border-cyan-500/20 rounded-2xl p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {/* Section Header */}
    <div className="flex items-center gap-3 mb-4">
      <GlowingSkeleton className="w-10 h-10" rounded="rounded-xl" color="cyan" />
      <Skeleton className="w-28 h-5" />
      <Skeleton className="w-6 h-6" rounded="rounded-full" />
    </div>

    {/* Cards */}
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BattleCardSkeletonV2 key={i} />
      ))}
    </div>
  </motion.div>
))
BattleListSkeletonV2.displayName = 'BattleListSkeletonV2'

// ============================================================================
// PAGE SKELETON
// ============================================================================

export const PageSkeletonV2 = memo(() => (
  <motion.div
    className="space-y-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <HeaderSkeletonV2 />
    <GlowingSkeleton className="w-full h-14" rounded="rounded-2xl" color="cyan" />
    <BattleListSkeletonV2 count={2} />
  </motion.div>
))
PageSkeletonV2.displayName = 'PageSkeletonV2'

export default {
  Skeleton,
  GlowingSkeleton,
  HeaderSkeletonV2,
  BattleCardSkeletonV2,
  BattleListSkeletonV2,
  PageSkeletonV2,
}

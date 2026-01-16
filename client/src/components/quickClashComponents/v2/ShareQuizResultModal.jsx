// ShareQuizResultModal.jsx
/**
 * Premium Share Modal for Quick Clash Quiz Results
 *
 * Uses CANVAS 2D API directly for reliable image generation
 * (html2canvas has known issues with CSS rendering)
 */

import React, { useState, useRef, useCallback, memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Link2,
  Sparkles,
} from 'lucide-react'
import { notificationManager } from '../../../utils/notifications'

// ═══════════════════════════════════════════════════════════════
// CANVAS IMAGE GENERATOR - Draw share card directly to canvas
// ═══════════════════════════════════════════════════════════════
const generateShareImage = async (rewardData) => {
  const {
    score = 0,
    forgeAccuracy = { correct: 0, total: 5, percentage: 0 },
    quizAccuracy = { correct: 0, total: 5, percentage: 0 },
    forgeScore = 0,
    quizScore = 0,
    totalCoins = 0,
    streakDay = 0,
    category = 'Quiz',
    percentileRank = 50,
  } = rewardData || {}

  // Canvas dimensions (2x for retina)
  const width = 720
  const height = 960

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Helper functions
  const drawRoundedRect = (x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const drawAccuracyRing = (x, y, size, percentage, color, glowColor, label, correct, total, scoreValue) => {
    const radius = size / 2 - 8
    const lineWidth = 14

    // Background ring
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Progress ring with glow
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (percentage / 100) * Math.PI * 2

    // Glow effect
    ctx.shadowColor = glowColor
    ctx.shadowBlur = 25

    ctx.beginPath()
    ctx.arc(x, y, radius, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.shadowBlur = 0

    // Center text - fraction
    ctx.fillStyle = 'white'
    ctx.font = 'bold 44px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${correct}/${total}`, x, y)

    // Label below
    ctx.fillStyle = color
    ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
    ctx.letterSpacing = '2px'
    ctx.fillText(label.toUpperCase(), x, y + size / 2 + 25)

    // Score badge below label
    drawRoundedRect(x - 45, y + size / 2 + 40, 90, 36, 18)
    ctx.fillStyle = `${color}25`
    ctx.fill()
    ctx.strokeStyle = `${color}40`
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = color
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText(`+${scoreValue}`, x, y + size / 2 + 58)
  }

  // Determine tier based on score - more vibrant
  const getTier = () => {
    if (score >= 90) return {
      label: '🏆 LEGENDARY',
      color: '#fcd34d',
      borderColors: ['#f59e0b', '#ef4444', '#fbbf24'],
      bgGlow: 'rgba(251, 191, 36, 0.25)'
    }
    if (score >= 70) return {
      label: '💎 EPIC',
      color: '#e879f9',
      borderColors: ['#a855f7', '#ec4899', '#c084fc'],
      bgGlow: 'rgba(168, 85, 247, 0.25)'
    }
    if (score >= 50) return {
      label: '⭐ GREAT',
      color: '#22d3ee',
      borderColors: ['#06b6d4', '#3b82f6', '#22d3ee'],
      bgGlow: 'rgba(6, 182, 212, 0.25)'
    }
    return {
      label: '✨ GOOD TRY',
      color: '#94a3b8',
      borderColors: ['#475569', '#64748b', '#94a3b8'],
      bgGlow: 'rgba(100, 116, 139, 0.15)'
    }
  }
  const tier = getTier()

  // Draw animated-looking outer border gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, tier.borderColors[0])
  gradient.addColorStop(0.33, tier.borderColors[1])
  gradient.addColorStop(0.66, tier.borderColors[2])
  gradient.addColorStop(1, tier.borderColors[0])
  drawRoundedRect(0, 0, width, height, 48)
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw inner card with rich gradient
  const cardGrad = ctx.createLinearGradient(0, 0, 0, height)
  cardGrad.addColorStop(0, '#1a1a35')
  cardGrad.addColorStop(0.3, '#0d0d20')
  cardGrad.addColorStop(0.7, '#0f0f25')
  cardGrad.addColorStop(1, '#1a1040')
  drawRoundedRect(10, 10, width - 20, height - 20, 40)
  ctx.fillStyle = cardGrad
  ctx.fill()

  // Add radial glow at top
  const topGlow = ctx.createRadialGradient(width / 2, 100, 0, width / 2, 100, 400)
  topGlow.addColorStop(0, tier.bgGlow)
  topGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = topGlow
  ctx.fillRect(10, 10, width - 20, 500)

  // Add subtle pattern overlay
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 50; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 3 + 1, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }
  ctx.globalAlpha = 1

  let yPos = 80

  // Tier label with glow
  ctx.shadowColor = tier.color
  ctx.shadowBlur = 25
  ctx.fillStyle = tier.color
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(tier.label, width / 2, yPos)
  ctx.shadowBlur = 0
  yPos += 60

  // Score with intense glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
  ctx.shadowBlur = 40
  ctx.fillStyle = 'white'
  ctx.font = 'bold 130px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(score.toString(), width / 2, yPos)
  ctx.shadowBlur = 0
  yPos += 145

  // "Total RQM Score"
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.font = '600 24px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('Total RQM Score', width / 2, yPos)
  yPos += 60

  // Accuracy rings with enhanced design
  const ringSize = 160
  const ringY = yPos + ringSize / 2
  drawAccuracyRing(
    width / 2 - 130, ringY, ringSize,
    forgeAccuracy.percentage, '#f59e0b', '#fbbf24',
    'Forge', forgeAccuracy.correct, forgeAccuracy.total, forgeScore
  )
  drawAccuracyRing(
    width / 2 + 130, ringY, ringSize,
    quizAccuracy.percentage, '#06b6d4', '#22d3ee',
    'Quiz', quizAccuracy.correct, quizAccuracy.total, quizScore
  )
  yPos += ringSize + 110

  // Stats row with glass effect
  const statsY = yPos
  const statsWidth = width - 100
  const statsHeight = 70
  const statsGrad = ctx.createLinearGradient(50, statsY - statsHeight / 2, 50, statsY + statsHeight / 2)
  statsGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
  statsGrad.addColorStop(1, 'rgba(255, 255, 255, 0.03)')
  drawRoundedRect(50, statsY - statsHeight / 2, statsWidth, statsHeight, 20)
  ctx.fillStyle = statsGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Coins with gold color
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`💰 ${totalCoins} Coins`, 85, statsY)

  // Streak with fire color
  if (streakDay > 0) {
    ctx.fillStyle = '#fb923c'
    ctx.textAlign = 'right'
    ctx.fillText(`🔥 ${streakDay} Day Streak`, width - 85, statsY)
  }
  yPos += 65

  // Category & Percentile row
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  // Category badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '500 22px system-ui, -apple-system, sans-serif'
  const catWidth = ctx.measureText(category).width + 32
  drawRoundedRect(50, yPos - 18, catWidth, 36, 18)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText(category, 66, yPos)

  // Percentile with highlight
  ctx.textAlign = 'right'
  ctx.fillStyle = tier.color
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText(`Top ${percentileRank}%`, width - 55, yPos)
  yPos += 60

  // Branding divider with gradient
  const dividerGrad = ctx.createLinearGradient(50, 0, width - 50, 0)
  dividerGrad.addColorStop(0, 'transparent')
  dividerGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.3)')
  dividerGrad.addColorStop(0.5, 'rgba(192, 132, 252, 0.5)')
  dividerGrad.addColorStop(0.7, 'rgba(192, 132, 252, 0.3)')
  dividerGrad.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.moveTo(50, yPos)
  ctx.lineTo(width - 50, yPos)
  ctx.strokeStyle = dividerGrad
  ctx.lineWidth = 1.5
  ctx.stroke()
  yPos += 50

  // Branding with enhanced glow
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.shadowColor = '#a855f7'
  ctx.shadowBlur = 20
  ctx.fillStyle = '#c084fc'
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
  ctx.fillText('✨ Rapid Recap', width / 2, yPos)
  ctx.shadowBlur = 0
  yPos += 45

  // Website link
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '500 18px system-ui, -apple-system, sans-serif'
  ctx.fillText('rapidrecap.ai', width / 2, yPos)

  return canvas.toDataURL('image/png', 0.95)
}

// ═══════════════════════════════════════════════════════════════
// PREVIEW CARD COMPONENT (for UI display only)
// ═══════════════════════════════════════════════════════════════
const PreviewCard = memo(({ rewardData }) => {
  const {
    score = 0,
    forgeAccuracy = { correct: 0, total: 5, percentage: 0 },
    quizAccuracy = { correct: 0, total: 5, percentage: 0 },
    forgeScore = 0,
    quizScore = 0,
    totalCoins = 0,
    streakDay = 0,
    category = 'Quiz',
    percentileRank = 50,
  } = rewardData || {}

  const getTier = () => {
    if (score >= 90) return { label: '🏆 LEGENDARY', color: 'text-amber-300', border: 'from-amber-500 via-red-500 to-amber-400' }
    if (score >= 70) return { label: '💎 EPIC', color: 'text-purple-300', border: 'from-purple-500 via-pink-500 to-purple-400' }
    if (score >= 50) return { label: '⭐ GREAT', color: 'text-cyan-300', border: 'from-cyan-500 via-blue-500 to-cyan-400' }
    return { label: '✨ GOOD TRY', color: 'text-slate-300', border: 'from-slate-500 via-slate-600 to-slate-500' }
  }
  const tier = getTier()

  return (
    <div className={`w-[260px] rounded-2xl p-[3px] bg-gradient-to-br ${tier.border}`}>
      <div className="bg-gradient-to-b from-[#1a1a35] via-[#0d0d20] to-[#1a1040] rounded-xl p-4 text-center relative overflow-hidden">
        {/* Subtle glow overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-50" />

        <div className={`text-xs font-bold ${tier.color} uppercase tracking-widest mb-2 relative z-10`}>
          {tier.label}
        </div>
        <div className="text-4xl font-black text-white relative z-10">{score}</div>
        <div className="text-xs text-white/50 mb-3 relative z-10">Total RQM Score</div>

        <div className="flex justify-center gap-5 mb-3 relative z-10">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{forgeAccuracy.correct}/{forgeAccuracy.total}</div>
            <div className="text-[10px] text-amber-400/70 uppercase font-medium">Forge</div>
            <div className="text-xs text-amber-400/60 mt-0.5">+{forgeScore}</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">{quizAccuracy.correct}/{quizAccuracy.total}</div>
            <div className="text-[10px] text-cyan-400/70 uppercase font-medium">Quiz</div>
            <div className="text-xs text-cyan-400/60 mt-0.5">+{quizScore}</div>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-white/60 mb-2 px-1 relative z-10">
          <span>💰 {totalCoins} Coins</span>
          {streakDay > 0 && <span>🔥 {streakDay} Day</span>}
        </div>

        <div className="text-[10px] text-purple-400 font-bold relative z-10">✨ Rapid Recap</div>
      </div>
    </div>
  )
})
PreviewCard.displayName = 'PreviewCard'

// ═══════════════════════════════════════════════════════════════
// SHARE MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════
const ShareQuizResultModal = memo(({ isOpen, onClose, rewardData, userTeams = [] }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Find a team with empty slots (< 4 members) for invite link
  const teamWithEmptySlots = userTeams?.find(t => (t.members?.length || 0) < 4)

  // Generate base URL
  const getBaseUrl = useCallback(() => {
    return window.location.origin.includes('localhost')
      ? 'https://rapidrecap.ai'
      : window.location.origin
  }, [])

  // Generate share link - includes team invite if available
  const getShareLink = useCallback(() => {
    const baseUrl = getBaseUrl()
    if (teamWithEmptySlots?.teamCode) {
      return `${baseUrl}/play/join/${teamWithEmptySlots.teamCode}`
    }
    return `${baseUrl}/play`
  }, [getBaseUrl, teamWithEmptySlots])

  // Generate share text
  const getShareText = useCallback(() => {
    const { score } = rewardData || {}
    let text = `I scored ${score} points! 🔥`

    if (teamWithEmptySlots) {
      // Has team with empty slots - encourage joining
      text += `\nJoin my team and let's rise together → ${getShareLink()}`
    } else {
      // No team or full team - generic invite
      text += `\nJoin me on Rapid Recap → ${getShareLink()}`
    }
    text += `\n#RapidRecap`
    return text
  }, [rewardData, teamWithEmptySlots, getShareLink])

  // Generate image using Canvas API
  const generateImage = useCallback(async () => {
    setIsGenerating(true)
    try {
      const dataUrl = await generateShareImage(rewardData)
      setImageDataUrl(dataUrl)
      return dataUrl
    } catch (error) {
      console.error('Error generating image:', error)
      notificationManager.error('Failed to generate image')
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [rewardData])

  // Handle copy link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareLink())
      setLinkCopied(true)
      notificationManager.success('Link copied!')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      notificationManager.error('Failed to copy link')
    }
  }, [getShareLink])

  // Handle native share
  const handleNativeShare = useCallback(async () => {
    const dataUrl = imageDataUrl || await generateImage()
    if (!dataUrl) return

    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'quick-clash-result.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My Quick Clash Result',
          text: getShareText(),
          url: getShareLink(),
          files: [file],
        })
        notificationManager.success('Shared successfully!')
      } else {
        handleDownload()
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error)
        handleDownload()
      }
    }
  }, [imageDataUrl, generateImage, getShareText, getShareLink])

  // Handle download
  const handleDownload = useCallback(async () => {
    const dataUrl = imageDataUrl || await generateImage()
    if (!dataUrl) return

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `quick-clash-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notificationManager.success('Image downloaded!')
  }, [imageDataUrl, generateImage])

  // Handle copy to clipboard
  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareText())
      setCopied(true)
      notificationManager.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      notificationManager.error('Failed to copy')
    }
  }, [getShareText])

  // Generate image on open
  useEffect(() => {
    if (isOpen) {
      setImageDataUrl(null)
      setLinkCopied(false)
      setCopied(false)
      const timer = setTimeout(() => generateImage(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen, generateImage])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button - positioned inside modal for visibility */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-20 p-2.5 bg-slate-800/90 border border-white/20 text-white/80 hover:text-white hover:bg-slate-700 transition-all rounded-full shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-white/80 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Share Your Achievement
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>

          {/* Preview Card */}
          <div className="flex justify-center mb-5">
            {imageDataUrl ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={imageDataUrl}
                alt="Share preview"
                className="w-[260px] rounded-2xl shadow-2xl shadow-purple-500/20"
              />
            ) : (
              <PreviewCard rewardData={rewardData} />
            )}
          </div>

          {/* Link Section */}
          <div className="mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-xs text-white/50 mb-2 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Share Link
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/30 rounded-lg px-3 py-2.5 text-white/70 text-sm font-mono truncate border border-white/5">
                {getShareLink()}
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all ${
                  linkCopied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                }`}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Share Button */}
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  Share Result
                </>
              )}
            </button>

            {/* Secondary Row */}
            <div className="flex gap-2.5">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-white/8 border border-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleCopyText}
                className="flex-1 py-3 px-4 rounded-xl bg-white/8 border border-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </button>
            </div>

            {/* Social Buttons */}
            <div className="flex gap-2.5">
              <button
                onClick={async () => {
                  const dataUrl = imageDataUrl || await generateImage()
                  if (!dataUrl) return

                  const link = document.createElement('a')
                  link.href = dataUrl
                  link.download = 'quick-clash-result.png'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)

                  setTimeout(() => {
                    const tweetText = getShareText()
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
                  }, 300)

                  notificationManager.info('Image downloaded! Attach it to your post 📎')
                }}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-black border border-white/20 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Post on X
              </button>
              <button
                onClick={async () => {
                  const dataUrl = imageDataUrl || await generateImage()
                  if (!dataUrl) return

                  const link = document.createElement('a')
                  link.href = dataUrl
                  link.download = 'quick-clash-result.png'
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)

                  try {
                    await navigator.clipboard.writeText(getShareText())
                  } catch (e) {}

                  setTimeout(() => {
                    const text = encodeURIComponent(getShareText())
                    // Try mobile WhatsApp first, then web
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                    if (isMobile) {
                      window.open(`whatsapp://send?text=${text}`, '_blank')
                    } else {
                      window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank')
                    }
                  }, 300)

                  notificationManager.info('Image downloaded & text copied! Paste in WhatsApp 📎')
                }}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/25 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})
ShareQuizResultModal.displayName = 'ShareQuizResultModal'

export default ShareQuizResultModal

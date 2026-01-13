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
  const height = 900

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

  const drawAccuracyRing = (x, y, size, percentage, color, label, correct, total) => {
    const radius = size / 2 - 6
    const lineWidth = 12

    // Glow effect
    ctx.shadowColor = color
    ctx.shadowBlur = 15

    // Background ring
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = lineWidth
    ctx.shadowBlur = 0
    ctx.stroke()

    // Progress ring with glow
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (percentage / 100) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(x, y, radius, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.shadowColor = color
    ctx.shadowBlur = 20
    ctx.stroke()
    ctx.shadowBlur = 0

    // Center text
    ctx.fillStyle = 'white'
    ctx.font = 'bold 38px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${correct}/${total}`, x, y)

    // Label below with color
    ctx.fillStyle = color
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText(label.toUpperCase(), x, y + size / 2 + 24)
  }

  // Determine tier based on score - vibrant colors
  const getTier = () => {
    if (score >= 90) return { label: '🏆 LEGENDARY', color: '#fcd34d', borderStart: '#f59e0b', borderEnd: '#ef4444', bgGlow: 'rgba(245, 158, 11, 0.2)' }
    if (score >= 70) return { label: '💎 EPIC', color: '#e879f9', borderStart: '#a855f7', borderEnd: '#ec4899', bgGlow: 'rgba(168, 85, 247, 0.2)' }
    if (score >= 50) return { label: '⭐ GREAT', color: '#22d3ee', borderStart: '#06b6d4', borderEnd: '#3b82f6', bgGlow: 'rgba(6, 182, 212, 0.2)' }
    return { label: '✨ NICE TRY', color: '#94a3b8', borderStart: '#475569', borderEnd: '#64748b', bgGlow: 'rgba(100, 116, 139, 0.1)' }
  }
  const tier = getTier()

  // Draw vibrant outer border gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, tier.borderStart)
  gradient.addColorStop(0.5, tier.borderEnd)
  gradient.addColorStop(1, tier.borderStart)
  drawRoundedRect(0, 0, width, height, 48)
  ctx.fillStyle = gradient
  ctx.fill()

  // Draw inner card with gradient
  const cardGrad = ctx.createLinearGradient(0, 0, 0, height)
  cardGrad.addColorStop(0, '#1e293b')
  cardGrad.addColorStop(0.5, '#0f172a')
  cardGrad.addColorStop(1, '#1e1b4b')
  drawRoundedRect(8, 8, width - 16, height - 16, 40)
  ctx.fillStyle = cardGrad
  ctx.fill()

  // Add radial glow at top
  const topGlow = ctx.createRadialGradient(width / 2, 50, 0, width / 2, 50, 350)
  topGlow.addColorStop(0, tier.bgGlow)
  topGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = topGlow
  ctx.fillRect(8, 8, width - 16, 400)

  let yPos = 70

  // Tier label with glow
  ctx.shadowColor = tier.color
  ctx.shadowBlur = 20
  ctx.fillStyle = tier.color
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(tier.label, width / 2, yPos)
  ctx.shadowBlur = 0
  yPos += 55

  // Score with glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)'
  ctx.shadowBlur = 30
  ctx.fillStyle = 'white'
  ctx.font = 'bold 120px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText(score.toString(), width / 2, yPos)
  ctx.shadowBlur = 0
  yPos += 130

  // "Total RQM Score"
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.font = '600 26px system-ui, -apple-system, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('Total RQM Score', width / 2, yPos)
  yPos += 55

  // Accuracy rings with glow
  const ringSize = 150
  const ringY = yPos + ringSize / 2
  drawAccuracyRing(width / 2 - 110, ringY, ringSize, forgeAccuracy.percentage, '#f59e0b', 'Forge', forgeAccuracy.correct, forgeAccuracy.total)
  drawAccuracyRing(width / 2 + 110, ringY, ringSize, quizAccuracy.percentage, '#06b6d4', 'Quiz', quizAccuracy.correct, quizAccuracy.total)
  yPos += ringSize + 65

  // Score breakdown badges
  const badgeY = yPos
  const badgeWidth = 100
  const badgeHeight = 44

  // Forge badge
  drawRoundedRect(width / 2 - 120 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 22)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#fcd34d'
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif'
  ctx.fillText(`+${forgeScore}`, width / 2 - 120, badgeY + 2)

  // Quiz badge
  drawRoundedRect(width / 2 + 120 - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, 22)
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#67e8f9'
  ctx.fillText(`+${quizScore}`, width / 2 + 120, badgeY + 2)
  yPos += 70

  // Stats row with glass effect
  const statsY = yPos
  const statsWidth = width - 80
  const statsHeight = 70
  const statsGrad = ctx.createLinearGradient(40, statsY - statsHeight / 2, 40, statsY + statsHeight / 2)
  statsGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
  statsGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
  drawRoundedRect(40, statsY - statsHeight / 2, statsWidth, statsHeight, 16)
  ctx.fillStyle = statsGrad
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Coins with gold color
  ctx.fillStyle = '#fbbf24'
  ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`💰 ${totalCoins} Coins`, 75, statsY)

  // Streak with orange color
  if (streakDay > 0) {
    ctx.fillStyle = '#fb923c'
    ctx.textAlign = 'right'
    ctx.fillText(`🔥 ${streakDay} Day Streak`, width - 75, statsY)
  }
  yPos += 65

  // Category & Percentile
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '500 22px system-ui, -apple-system, sans-serif'

  // Category badge
  const catWidth = ctx.measureText(category).width + 28
  drawRoundedRect(40, yPos - 18, catWidth, 36, 18)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.fillText(category, 54, yPos)

  // Percentile with highlight
  ctx.textAlign = 'right'
  ctx.fillStyle = tier.color
  ctx.fillText(`Top ${percentileRank}%`, width - 45, yPos)
  yPos += 55

  // Branding divider with gradient
  const dividerGrad = ctx.createLinearGradient(40, 0, width - 40, 0)
  dividerGrad.addColorStop(0, 'transparent')
  dividerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
  dividerGrad.addColorStop(1, 'transparent')
  ctx.beginPath()
  ctx.moveTo(40, yPos)
  ctx.lineTo(width - 40, yPos)
  ctx.strokeStyle = dividerGrad
  ctx.lineWidth = 1
  ctx.stroke()
  yPos += 45

  // Branding with glow
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.shadowColor = '#a855f7'
  ctx.shadowBlur = 15
  ctx.fillStyle = '#c084fc'
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
  ctx.fillText('✨ Rapid Recap', width / 2, yPos)
  ctx.shadowBlur = 0

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
    if (score >= 90) return { label: '🏆 LEGENDARY', color: 'text-amber-300', border: 'border-amber-500' }
    if (score >= 70) return { label: '💎 EPIC', color: 'text-purple-300', border: 'border-purple-500' }
    if (score >= 50) return { label: '⭐ GREAT', color: 'text-cyan-300', border: 'border-cyan-500' }
    return { label: '✨ NICE TRY', color: 'text-slate-300', border: 'border-slate-500' }
  }
  const tier = getTier()

  return (
    <div className={`w-[280px] rounded-2xl p-1 bg-gradient-to-br from-slate-700 to-slate-800 ${tier.border} border-2`}>
      <div className="bg-slate-900 rounded-xl p-4 text-center">
        <div className={`text-xs font-bold ${tier.color} uppercase tracking-widest mb-2`}>
          {tier.label}
        </div>
        <div className="text-4xl font-black text-white">{score}</div>
        <div className="text-xs text-white/60 mb-3">Total RQM Score</div>

        <div className="flex justify-center gap-4 mb-3">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{forgeAccuracy.correct}/{forgeAccuracy.total}</div>
            <div className="text-[10px] text-white/60 uppercase">Forge</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-cyan-400">{quizAccuracy.correct}/{quizAccuracy.total}</div>
            <div className="text-[10px] text-white/60 uppercase">Quiz</div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-white/70 mb-2">
          <span>💰 {totalCoins} Coins</span>
          {streakDay > 0 && <span>🔥 {streakDay} Day</span>}
        </div>

        <div className="text-[10px] text-purple-400 font-bold">✨ Rapid Recap</div>
      </div>
    </div>
  )
})
PreviewCard.displayName = 'PreviewCard'

// ═══════════════════════════════════════════════════════════════
// SHARE MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════
const ShareQuizResultModal = memo(({ isOpen, onClose, rewardData }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  // Generate share text
  const getShareText = useCallback(() => {
    const { score, forgeAccuracy, quizAccuracy, category, streakDay } = rewardData || {}
    let text = `🎯 I scored ${score} RQM in ${category}!`
    text += `\n⚒️ Forge: ${forgeAccuracy?.correct || 0}/${forgeAccuracy?.total || 5}`
    text += `\n❓ Quiz: ${quizAccuracy?.correct || 0}/${quizAccuracy?.total || 5}`
    if (streakDay > 0) text += `\n🔥 ${streakDay} day streak!`
    text += `\n\nChallenge me on Rapid Recap! #QuickClash`
    return text
  }, [rewardData])

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
  }, [imageDataUrl, generateImage, getShareText])

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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-lg"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Preview */}
          <div className="flex justify-center mb-6">
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Share preview" className="w-[280px] rounded-2xl shadow-2xl" />
            ) : (
              <PreviewCard rewardData={rewardData} />
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
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

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleCopyText}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
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
            <div className="flex gap-3">
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
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`, '_blank')
                  }, 300)

                  notificationManager.info('Image downloaded! Attach it to your post 📎')
                }}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] font-medium flex items-center justify-center gap-2 hover:bg-[#1DA1F2]/30 transition-colors disabled:opacity-50"
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
                    window.open('https://web.whatsapp.com/', '_blank')
                  }, 300)

                  notificationManager.info('Image downloaded & text copied! Paste in WhatsApp 📎')
                }}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-medium flex items-center justify-center gap-2 hover:bg-[#25D366]/30 transition-colors disabled:opacity-50"
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

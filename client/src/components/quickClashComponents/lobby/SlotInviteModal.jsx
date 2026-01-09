// components/quickClashComponents/lobby/SlotInviteModal.jsx
// Spark Engine - Share invite modal with copy and native share
import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const SlotInviteModal = ({ inviteUrl, teamCode, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState('')

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setShareError('Failed to copy')
    }
  }, [inviteUrl])

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) {
      handleCopy()
      return
    }

    try {
      await navigator.share({
        title: 'Join my Quick Clash squad!',
        text: `Join my team and let's battle! Team code: ${teamCode}`,
        url: inviteUrl,
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        handleCopy()
      }
    }
  }, [inviteUrl, teamCode, handleCopy])

  const handleWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`Join my Quick Clash squad! 🎮⚡\n\nTeam code: ${teamCode}\n\n${inviteUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }, [inviteUrl, teamCode])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Invite to Squad</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Team Code Display */}
        <div style={styles.codeSection}>
          <span style={styles.codeLabel}>Team Code</span>
          <div style={styles.codeBox}>
            <span style={styles.code}>{teamCode}</span>
          </div>
        </div>

        {/* Invite Link */}
        <div style={styles.linkSection}>
          <span style={styles.linkLabel}>Invite Link</span>
          <div style={styles.linkBox}>
            <input
              type="text"
              value={inviteUrl}
              readOnly
              style={styles.linkInput}
            />
            <motion.button
              style={{
                ...styles.copyBtn,
                background: copied ? '#10b981' : 'rgba(102, 126, 234, 0.2)',
              }}
              onClick={handleCopy}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? '✓' : '📋'}
            </motion.button>
          </div>
        </div>

        {/* Share Buttons */}
        <div style={styles.shareButtons}>
          <motion.button
            style={{ ...styles.shareBtn, ...styles.whatsappBtn }}
            onClick={handleWhatsApp}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span style={{ fontSize: 20 }}>💬</span>
            WhatsApp
          </motion.button>

          <motion.button
            style={{ ...styles.shareBtn, ...styles.nativeShareBtn }}
            onClick={handleNativeShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span style={{ fontSize: 20 }}>📤</span>
            Share
          </motion.button>
        </div>

        {/* Error message */}
        {shareError && <p style={styles.error}>{shareError}</p>}

        {/* Help text */}
        <p style={styles.helpText}>
          Share this link with friends. They'll join instantly!
        </p>
      </motion.div>
    </motion.div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    background: 'rgba(20, 20, 30, 0.95)',
    borderRadius: 20,
    padding: 24,
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: 8,
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    fontSize: 14,
  },
  codeSection: {
    marginBottom: 20,
  },
  codeLabel: {
    display: 'block',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  codeBox: {
    padding: '16px 20px',
    background: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    border: '1px solid rgba(102, 126, 234, 0.2)',
    textAlign: 'center',
  },
  code: {
    fontSize: 24,
    fontWeight: 700,
    color: '#667eea',
    letterSpacing: 4,
  },
  linkSection: {
    marginBottom: 20,
  },
  linkLabel: {
    display: 'block',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  linkBox: {
    display: 'flex',
    gap: 8,
  },
  linkInput: {
    flex: 1,
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 13,
    outline: 'none',
  },
  copyBtn: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 18,
    transition: 'all 0.2s ease',
  },
  shareButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
    marginBottom: 16,
  },
  shareBtn: {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    transition: 'all 0.2s ease',
  },
  whatsappBtn: {
    background: '#25d366',
  },
  nativeShareBtn: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  error: {
    fontSize: 13,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    margin: 0,
  },
}

export default SlotInviteModal

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Zap, BookOpen, Trophy, ArrowRight, MousePointerClick, Swords, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TutorialOverlay = ({ type, isSessionPlayer, stepIndex, onNext, onComplete, onDismiss }) => {
  // const [stepIndex, setStepIndex] = useState(0) // REMOVED local state

  const getSteps = () => {
    switch(type) {
      case 'lobby':
        return [
          {
            title: "🚀 Welcome to Quick Clash!",
            description: "Read. Learn. Battle. Compete in real-time quiz battles, master new topics, and climb the global leaderboard!",
            icon: <Swords className="w-16 h-16 text-emerald-400" />,
            action: "Cool!",
            gradient: "from-emerald-500/30 to-teal-600/30"
          },
          {
            title: "🎮 Ready to Battle?",
            description: "Team up with friends for a 75% higher win rate! Invite your squad and dominate the arena together.",
            icon: <Users className="w-16 h-16 text-cyan-400" />,
            action: "Let's Go!",
            gradient: "from-cyan-500/30 to-blue-600/30"
          }
        ]
      case 'squad_intro':
        return [{
          title: "⚔️ Join the Battle!",
          description: "Ready to prove yourself? Tap the SQUAD button to find opponents and climb the leaderboard!",
          icon: <Swords className="w-16 h-16 text-emerald-400" />,
          action: null,
          gradient: "from-emerald-500/30 to-cyan-600/30"
        }]
      case 'coins_shop':
        return [{
          title: "💰 You've Got Coins!",
          description: "Tap the coins in the header to open the Powerup Shop. Grab boosts to dominate your battles!",
          icon: <Coins className="w-16 h-16 text-amber-400" />,
          action: "Got it!",
          gradient: "from-amber-500/30 to-orange-600/30"
        }]
      case 'battle':
        const steps = []

        // Auth users only: Interactive Powerup Flow (Steps 0-3)
        if (!isSessionPlayer) {
          // Step 0: Powerup Overview - Intro
          steps.push({
            title: "⚡ Manage Your Powerups",
            description: "Before battle, donate powerups to your team and equip them for yourself! Tap the pulsing gift icon to start.",
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            action: null,
            gradient: "from-yellow-500/30 to-amber-600/30",
            stepType: 'powerup_intro'
          })

          // Step 1: Inside Donation Modal
          steps.push({
            title: "🎁 Donate to Team!",
            description: "Tap any powerup from your inventory to share it with your team pool. Your teammates can use donated powerups!",
            icon: <Zap className="w-12 h-12 text-purple-400" />,
            action: null,
            gradient: "from-purple-500/30 to-pink-600/30",
            stepType: 'donation_modal'
          })

          // Step 2: Prompt to Open Equip
          steps.push({
            title: "🛡️ Equip for Battle!",
            description: "Now tap the pulsing 'Equip' button to load powerups from the team pool for yourself!",
            icon: <Zap className="w-12 h-12 text-cyan-400" />,
            action: null,
            gradient: "from-cyan-500/30 to-blue-600/30",
            stepType: 'equip_prompt'
          })

          // Step 3: Inside Loadout Modal
          steps.push({
            title: "⚔️ Load Your Arsenal!",
            description: "Tap powerups from the team pool to equip them. They'll be ready to use during battle!",
            icon: <Zap className="w-12 h-12 text-emerald-400" />,
            action: "Ready to Battle!",
            gradient: "from-emerald-500/30 to-teal-600/30",
            stepType: 'loadout_modal'
          })
        }

        // All users: Category Selection, Forge, Quiz
        steps.push(
          {
            title: "🎯 Choose Your Category",
            description: "Pick a topic you're confident in! Tap any category card above to select it.",
            icon: <MousePointerClick className="w-12 h-12 text-purple-400" />,
            action: null,
            gradient: "from-purple-500/30 to-pink-600/30",
            stepType: 'category'
          },
          {
            title: "📖 Learn & Answer",
            description: "5 rounds await! Answer a question (15s), then read the context to build your knowledge (30s).",
            icon: <BookOpen className="w-12 h-12 text-blue-400" />,
            action: "Next",
            gradient: "from-blue-500/30 to-cyan-600/30",
            stepType: 'forge'
          },
          {
            title: "🏆 The Final Quiz",
            description: "Show what you've learned! 5 rapid-fire questions in 50 seconds. Score big to win!",
            icon: <Trophy className="w-12 h-12 text-amber-400" />,
            action: isSessionPlayer ? "Start Battle!" : "Next",
            gradient: "from-amber-500/30 to-orange-600/30",
            stepType: 'quiz'
          }
        )

        // Auth users only: Using Powerups during battle (LAST)
        if (!isSessionPlayer) {
          steps.push({
            title: "💥 Activate Power-ups!",
            description: "Stuck on a tough question? Activate equipped powerups like 'Time Warp' or 'Oracle's Eye' to turn the tide!",
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            action: "Start Battle!",
            gradient: "from-yellow-500/30 to-red-600/30",
            stepType: 'activate'
          })
        }
        return steps

      default:
        return []
    }
  }

  const steps = getSteps()
  const currentStep = steps[stepIndex]

  const handleNext = (e) => {
    e?.stopPropagation() // Prevent click-through
    if (stepIndex < steps.length - 1) {
      onNext()
    } else {
      onComplete()
    }
  }


  if (!currentStep) return null

  // Get step type for specialized positioning
  const stepType = currentStep.stepType || ''

  // Special "Dialogue Box" style for Battle (smaller, lower)
  const isDialogueStyle = type === 'battle'
  // Tooltip style for Squad Intro and Coins Shop (positioned near top)
  const isTooltipStyle = type === 'squad_intro' || type === 'coins_shop'
  // Coins-specific styling (top-left position for coins display area)
  const isCoinsStyle = type === 'coins_shop'
  // Powerup intro and equip prompt step - position below centered powerup box
  const isPowerupStep = stepType === 'powerup_intro' || stepType === 'equip_prompt'
  // Modal overlay steps - render inside modals with higher z-index
  const isModalOverlayStep = stepType === 'donation_modal' || stepType === 'loadout_modal'

  // For modal overlay steps, use z-index above modals (z-[200])
  const zIndex = isModalOverlayStep ? 'z-[200]' : 'z-[9999]'

  return (
    <AnimatePresence mode="wait">
      <div className={`fixed inset-0 ${zIndex} flex ${
        isModalOverlayStep ? 'items-end pb-8 justify-center' :
        isPowerupStep ? 'justify-center' :
        isDialogueStyle ? 'items-end pb-24 md:pb-32 justify-center' :
        isCoinsStyle ? 'items-start pt-16 justify-start pl-3' :
        'items-center justify-center'
      } pointer-events-none`}
      style={isPowerupStep ? { paddingTop: 'calc(50vh + 40px)' } : {}}>


        {/* Backdrop - only for Lobby (full dark), Squad Intro (lighter) */}
        {type === 'lobby' && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
             onClick={onDismiss}
           />
        )}
        {/* Squad Intro - No backdrop, floating modal only */}

        {/* Modal/Dialogue Card */}
        <motion.div
           key={stepIndex}
           initial={{ scale: 0.9, opacity: 0, y: 20 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           exit={{ scale: 0.9, opacity: 0, y: -20 }}
           transition={{ type: "spring", damping: 25, stiffness: 300 }}
           className={`
             relative pointer-events-auto
             ${isDialogueStyle ? 'w-[95%] max-w-xl' :
               isTooltipStyle ? 'w-[85%] max-w-sm' :
               'w-[90%] max-w-md'}
           `}
        >
            <div className={`
                relative overflow-hidden
                ${isDialogueStyle ? 'rounded-2xl p-5' :
                  isTooltipStyle ? 'rounded-2xl p-5 text-center' :
                  'rounded-3xl flex flex-col items-center p-8 space-y-6 text-center'}
                border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl
            `}>
                {/* Background Gradient Blob */}
                <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${currentStep.gradient} blur-3xl opacity-30 pointer-events-none`} />

                {/* Close Button */}
                <button
                    onClick={onDismiss}
                    className="absolute top-2 right-2 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X size={16} />
                </button>

                {/* Content Layout */}
                {isDialogueStyle ? (
                   // Dialogue Row Layout (Battle) - Compact and dynamic
                   <div className="flex items-start gap-4">
                      {/* Colored Icon Container */}
                      <div className={`flex-shrink-0 p-3 rounded-xl border bg-gradient-to-br ${currentStep.gradient} border-white/20 mt-1`}>
                          {React.cloneElement(currentStep.icon, { className: "w-8 h-8 " + (currentStep.icon.props.className || '').split(' ').pop() })}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-bold text-white mb-1.5 pr-6">{currentStep.title}</h2>
                          <p className="text-sm text-slate-300 leading-relaxed mb-3">{currentStep.description}</p>

                          <div className="flex items-center justify-between gap-3">
                              {/* Progress Dots */}
                              <div className="flex space-x-1.5">
                                {steps.length > 1 && steps.map((_, idx) => (
                                  <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === stepIndex ? 'w-6 bg-gradient-to-r from-white to-white/80' : idx < stepIndex ? 'w-2 bg-white/50' : 'w-2 bg-white/20'}`} />
                                ))}
                              </div>

                              {/* Action Button - Gradient style */}
                              {currentStep.action && (
                                <Button
                                    onClick={handleNext}
                                    size="sm"
                                    className="h-9 px-5 text-sm font-bold bg-gradient-to-r from-white to-slate-100 text-slate-900 hover:from-slate-100 hover:to-white rounded-lg whitespace-nowrap shadow-md"
                                >
                                    {currentStep.action}
                                    {stepIndex < steps.length - 1 && <ArrowRight className="ml-1.5 w-3.5 h-3.5" />}
                                </Button>
                              )}
                          </div>
                      </div>
                   </div>
                ) : isTooltipStyle ? (
                   // Tooltip Layout for Squad Intro and Coins Shop
                   <div className="flex flex-col items-center gap-3">
                      {/* Small Icon - Dynamic color based on type */}
                      <div className={`p-3 rounded-xl border ${
                        isCoinsStyle
                          ? 'bg-amber-500/20 border-amber-400/30'
                          : 'bg-emerald-500/20 border-emerald-400/30'
                      }`}>
                          {React.cloneElement(currentStep.icon, {
                            className: `w-10 h-10 ${isCoinsStyle ? 'text-amber-400' : 'text-emerald-400'}`
                          })}
                      </div>

                      {/* Text */}
                      <div>
                          <h2 className="text-lg font-bold text-white mb-1">{currentStep.title}</h2>
                          <p className="text-sm text-slate-300 leading-relaxed">{currentStep.description}</p>
                      </div>

                      {/* Coins Shop: Arrow pointing UP-LEFT to coins + Action Button */}
                      {isCoinsStyle ? (
                        <>
                          <div className="mt-1 flex flex-col items-center animate-bounce">
                            <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-amber-400" />
                            <span className="text-xs text-amber-400 font-semibold mt-1">Tap above!</span>
                          </div>
                          {currentStep.action && (
                            <Button
                              onClick={handleNext}
                              className="mt-2 w-full h-10 font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl shadow-lg"
                            >
                              {currentStep.action}
                            </Button>
                          )}
                        </>
                      ) : (
                        /* Squad Intro: Pulsing arrow pointing UP */
                        <div className="mt-2 flex flex-col items-center animate-bounce">
                          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-emerald-400" />
                          <span className="text-xs text-emerald-400 font-semibold mt-1">Tap above!</span>
                        </div>
                      )}
                   </div>
                ) : (
                   // Modal Column Layout (Lobby) - Premium centered design
                   <>
                      {/* Animated Icon Container */}
                      <div className="relative z-10">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" />
                          <div className="relative p-5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl border border-cyan-400/30 ring-2 ring-cyan-400/20">
                              {currentStep.icon}
                          </div>
                      </div>

                      {/* Text Content */}
                      <div className="space-y-3">
                          <h2 className="text-2xl font-bold text-white tracking-tight">
                              {currentStep.title}
                          </h2>
                          <p className="text-base text-slate-300 leading-relaxed">
                              {currentStep.description}
                          </p>
                      </div>

                      {/* Gradient CTA Button */}
                      <Button
                          onClick={handleNext}
                          className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all rounded-xl shadow-lg shadow-cyan-500/25 border border-cyan-400/30"
                      >
                          {currentStep.action}
                      </Button>
                   </>
                )}

            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default TutorialOverlay

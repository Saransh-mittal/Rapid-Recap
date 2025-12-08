import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Trophy, Clock, Target, TrendingUp } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ScoreHero from './report/ScoreHero'
import BattleLog from './report/BattleLog'
import QuestionReview from './report/QuestionReview'
import { parseQuizData } from '../../utils/quiz.utils'
import { cn } from '@/lib/utils'
import { QUICK_CLASH_COLORS, QUICK_CLASH_CLASSES } from './utils/quickClashColors'

const NewQuizReportModal = ({ result, onClose }) => {
  const quizData = useMemo(() => parseQuizData(result), [result])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 overflow-y-auto">
      {/* Enhanced Ambient Background with Cyan/Blue theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary cyan glow - top left */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[30%] -left-[30%] w-[80%] h-[80%] bg-cyan-500/30 blur-[150px] rounded-full"
        />
        {/* Secondary blue glow - bottom right */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[30%] -right-[30%] w-[90%] h-[90%] bg-blue-600/25 blur-[180px] rounded-full"
        />
        {/* Accent cyan glow - center */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-cyan-400/20 blur-[100px] rounded-full"
        />
        {/* Floating particles effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_50%)]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 min-h-screen py-6 px-4 max-w-md mx-auto"
      >
        {/* Enhanced Close Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/60 hover:text-cyan-400 hover:bg-cyan-500/10 hover:rotate-90 hover:scale-110 transition-all duration-300 rounded-full border border-transparent hover:border-cyan-500/30"
            onClick={onClose}
          >
            <X size={24} />
          </Button>
        </motion.div>

        <div className="flex flex-col gap-8 pb-10">
          {/* Enhanced Header with Gradient */}
          <motion.div variants={itemVariants} className="flex flex-col gap-2 mt-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-2"
            >
              <div className="relative">
                <Trophy className="w-10 h-10 text-cyan-400" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-cyan-400 blur-xl rounded-full opacity-50"
                />
              </div>
            </motion.div>
            <span className="text-xs font-bold text-cyan-400 tracking-[0.3em] uppercase">
              Mission Complete
            </span>
            <h2 className="text-3xl font-black bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent tracking-tight">
              BATTLE REPORT
            </h2>
            <div className="w-24 h-0.5 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-1" />
          </motion.div>

          {/* Hero Section */}
          <motion.div variants={itemVariants}>
            <ScoreHero
              totalScore={quizData.finalRQM}
              quizScore={quizData.baseRQM}
              forgeScore={quizData.forgeScore}
              precisionBonus={quizData.precisionBonus}
              scoreSurgeBonus={quizData.scoreSurgeBonus}
            />
          </motion.div>

          {/* Enhanced Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-1.5 h-auto shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <TabsTrigger
                  value="overview"
                  className="text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 data-[state=active]:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-xl text-sm font-bold transition-all duration-300"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="battle-log"
                  className="text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 data-[state=active]:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-xl text-sm font-bold transition-all duration-300"
                >
                  Battle Log
                </TabsTrigger>
                <TabsTrigger
                  value="intel"
                  className="text-white/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-500/30 data-[state=active]:shadow-[0_0_20px_rgba(6,182,212,0.2)] rounded-xl text-sm font-bold transition-all duration-300"
                >
                  Intel
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex gap-4">
                      {/* Time Card */}
                      <div className="flex-1 p-5 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-start justify-between">
                          <div>
                            <p className="text-xs text-cyan-400/70 font-bold tracking-wider mb-1 flex items-center gap-1.5">
                              <Clock size={12} />
                              TIME
                            </p>
                            <p className="text-3xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{quizData.timeTaken}s</p>
                          </div>
                        </div>
                      </div>
                      {/* Accuracy Card */}
                      <div className="flex-1 p-5 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative flex items-start justify-between">
                          <div>
                            <p className="text-xs text-blue-400/70 font-bold tracking-wider mb-1 flex items-center gap-1.5">
                              <Target size={12} />
                              ACCURACY
                            </p>
                            <p className="text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{Math.round(quizData.score.percentage)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Difficulty Card */}
                    <div className="p-5 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/20 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-xs text-cyan-400/70 font-bold tracking-wider mb-1 flex items-center gap-1.5">
                            <TrendingUp size={12} />
                            DIFFICULTY RATING
                          </p>
                          <p className="text-2xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent capitalize">{quizData.difficulty}</p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "w-2 h-6 rounded-full transition-all duration-300",
                                level <= (quizData.difficulty === 'easy' ? 1 : quizData.difficulty === 'medium' ? 3 : 5)
                                  ? "bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                  : "bg-white/10"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="battle-log" className="outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BattleLog activePowerups={quizData.activePowerups} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="intel" className="outline-none">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <QuestionReview
                      questions={quizData.questions}
                      forgeQuestions={quizData.forgeQuestions}
                    />
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default NewQuizReportModal

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, ChevronDown, BookOpen, Flame, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

const QuestionItem = ({ q, isForge, index }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "bg-slate-900/50 backdrop-blur-xl border rounded-2xl transition-all duration-300 overflow-hidden",
          isOpen ? "border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "border-white/10",
          q.isCorrect ? "hover:border-green-500/40" : "hover:border-red-500/40"
        )}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3 text-left flex-1 min-w-0">
            <motion.div
              animate={isOpen ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "shrink-0 p-1.5 rounded-full",
                q.isCorrect ? "bg-green-500/20" : "bg-red-500/20"
              )}
            >
              {q.isCorrect ? (
                <CheckCircle size={18} className="text-green-400" />
              ) : (
                <XCircle size={18} className="text-red-400" />
              )}
            </motion.div>
            <div className="flex flex-col items-start min-w-0 flex-1 gap-0.5">
              <span className="text-sm font-medium text-white truncate w-full">
                {q.question}
              </span>
              {isForge && (
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                  <Flame size={10} />
                  Score: {q.score}
                </span>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} className="text-cyan-400/60 shrink-0 ml-2" />
          </motion.div>
        </CollapsibleTrigger>

        <AnimatePresence>
          {isOpen && (
            <CollapsibleContent forceMount>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pb-4 pt-0 space-y-3"
              >
                {/* Your Answer */}
                <div className={cn(
                  "p-3 rounded-xl backdrop-blur-xl border",
                  q.isCorrect
                    ? "bg-green-500/5 border-green-500/20"
                    : "bg-slate-900/60 border-white/10"
                )}>
                  <p className="text-xs text-white/50 mb-1.5 font-medium">Your Answer</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      q.isCorrect ? "text-green-300" : "text-red-300"
                    )}>
                      {q.userAnswer}
                    </span>
                    {!q.isCorrect && (
                      <Badge className="text-[10px] px-1.5 py-0.5 h-auto bg-red-500/20 text-red-300 border-red-500/30">
                        Incorrect
                      </Badge>
                    )}
                    {q.isCorrect && (
                      <Badge className="text-[10px] px-1.5 py-0.5 h-auto bg-green-500/20 text-green-300 border-green-500/30">
                        Correct
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Correct Answer (if incorrect) */}
                {!q.isCorrect && (
                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                    <p className="text-xs text-cyan-300/70 mb-1.5 font-medium flex items-center gap-1">
                      <CheckCircle size={10} />
                      Correct Answer
                    </p>
                    <p className="text-sm font-bold text-cyan-300">
                      {q.answer}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs font-bold text-blue-300/70 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb size={10} />
                    Intel
                  </p>
                  <p className="text-sm text-white/70 italic leading-relaxed">
                    "{q.explanation}"
                  </p>
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </motion.div>
  )
}

const QuestionReview = ({ questions = [], forgeQuestions = [] }) => {
  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Quiz Questions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
          <BookOpen size={14} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-[0.15em]">
            Quiz Analysis
          </h3>
          <Badge className="ml-auto text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
            {questions.filter(q => q.isCorrect).length}/{questions.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {questions.map((q, i) => {
             // Handle quiz options being an object {a,b,c,d}
             const userAnswerText = typeof q.userAnswer === 'string' && q.options && q.options[q.userAnswer] ? q.options[q.userAnswer] : q.userAnswer
             const answerText = typeof q.answer === 'string' && q.options && q.options[q.answer] ? q.options[q.answer] : q.answer

             return (
               <QuestionItem
                 key={`quiz-${i}`}
                 index={i}
                 q={{
                   ...q,
                   userAnswer: userAnswerText,
                   answer: answerText
                 }}
               />
             )
          })}
        </div>
      </div>

      {/* Forge Questions */}
      {forgeQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-red-500 rounded-full" />
            <Flame size={14} className="text-orange-400" />
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-[0.15em]">
              Forge Analysis
            </h3>
            <Badge className="ml-auto text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-300 border-orange-500/30">
              {forgeQuestions.filter(q => q.isCorrect).length}/{forgeQuestions.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {forgeQuestions.map((q, i) => (
              <QuestionItem key={`forge-${i}`} index={i} q={q} isForge={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionReview


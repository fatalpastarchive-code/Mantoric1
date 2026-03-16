"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Brain, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizAreaProps {
  articleId: string
  xpReward: number
  onComplete: () => void
}

// Default questions for when API fails
const DEFAULT_QUESTIONS: Question[] = [
  {
    question: "What is the main theme or key insight of this treatise?",
    options: ["Personal growth through discipline", "Understanding market dynamics", "Stoic philosophy application", "The author has no clear point"],
    correctAnswer: 0
  },
  {
    question: "According to the text, what approach yields the best results?",
    options: ["Quick, impulsive decisions", "Long-term consistent effort", "Waiting for perfect conditions", "Following others blindly"],
    correctAnswer: 1
  }
]

export function QuizArea({ articleId, xpReward, onComplete }: QuizAreaProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isFinished, setIsPassed] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch or generate questions based on article
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/quiz`)
        if (res.ok) {
          const data = await res.json()
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions)
          } else {
            setQuestions(DEFAULT_QUESTIONS)
          }
        } else {
          setQuestions(DEFAULT_QUESTIONS)
        }
      } catch (e) {
        console.error("Failed to fetch quiz questions", e)
        setQuestions(DEFAULT_QUESTIONS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [articleId])

  const handleAnswer = (index: number) => {
    if (questions.length === 0) return
    
    setSelectedOption(index)
    
    const isCorrect = index === questions[currentStep].correctAnswer
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(s => s + 1)
        setSelectedOption(null)
      } else {
        const finalScore = isCorrect ? score + 1 : score
        const passed = finalScore / questions.length >= 0.5
        setIsPassed(passed)
        if (passed) {
          submitResult(finalScore)
          onComplete()
        }
      }
    }, 600)
  }

  const submitResult = async (finalScore: number) => {
    try {
      await fetch(`/api/articles/${articleId}/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalScore, total: questions.length }),
      })
      toast.success(`Knowledge Verified! +${xpReward} XP awarded.`)
    } catch (e) {
      console.error("Failed to submit quiz", e)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-secondary/20 rounded-2xl border border-border/30">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Generating knowledge check...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
        <Brain className="h-8 w-8 text-yellow-500 mb-4" />
        <p className="text-sm text-muted-foreground">Unable to generate questions. Skipping verification.</p>
        <Button onClick={onComplete} className="mt-4" variant="outline">Continue</Button>
      </div>
    )
  }

  if (isFinished === true) return (
    <div className="flex flex-col items-center justify-center p-8 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 animate-in fade-in zoom-in-95">
      <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
      <h3 className="text-xl font-bold text-foreground">Treatise Understood</h3>
      <p className="text-sm text-muted-foreground mt-1">Your intellectual progress has been recorded.</p>
      <div className="mt-4 flex items-center gap-2 text-emerald-400">
        <Sparkles className="h-4 w-4" />
        <span className="font-bold">+{xpReward} XP Earned</span>
      </div>
    </div>
  )

  if (isFinished === false) return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
      <XCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-foreground">Synthesis Failed</h3>
      <p className="text-sm text-muted-foreground mt-1 text-center">You must read more carefully to earn XP. Refresh to try again.</p>
    </div>
  )

  return (
    <div className="space-y-6 p-6 bg-secondary/20 rounded-2xl border border-border/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <span className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">Knowledge Check</span>
        </div>
        <div className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Reward: {xpReward} XP
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[17px] font-extrabold leading-tight text-foreground">
          {questions[currentStep]?.question}
        </h4>
        
        <div className="grid gap-2">
          {questions[currentStep]?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => selectedOption === null && handleAnswer(idx)}
              className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                selectedOption === idx
                  ? idx === questions[currentStep].correctAnswer
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-background/50 border-border/30 hover:border-primary/50 hover:bg-background"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-1">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 w-8 rounded-full ${i === currentStep ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  )
}

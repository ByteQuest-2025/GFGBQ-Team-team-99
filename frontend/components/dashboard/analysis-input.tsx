"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export function AnalysisInput({ onAnalyze, analyzing }: { onAnalyze: (val: string) => void; analyzing: boolean }) {
  const [text, setText] = useState("")

  return (
    <div className="glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Paste AI-Generated Response <Sparkles className="w-4 h-4 text-primary" />
            </h2>
            <p className="text-xs text-muted-foreground">Compatible with GPT-4, Claude 3.5, and Gemini Pro</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] h-7 bg-white/5 border border-white/5 hover:bg-white/10 uppercase tracking-widest font-bold"
          >
            Auto-Detect Source
          </Button>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Paste the LLM output here for deep verification..."
            className="min-h-[200px] bg-black/40 border-white/10 focus-visible:ring-primary/50 text-base leading-relaxed resize-none rounded-2xl p-6 transition-all focus:bg-black/60"
            disabled={analyzing}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="absolute bottom-4 right-6 text-[10px] text-muted-foreground font-mono">
            {text.length.toLocaleString()} / 12,000 chars
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase px-2 py-0.5">
              Claim Extraction
            </Badge>
            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] uppercase px-2 py-0.5">
              Citation Check
            </Badge>
          </div>
          <Button
            onClick={() => onAnalyze(text)}
            disabled={analyzing || !text.trim()}
            className="h-12 px-10 font-bold glow-primary rounded-xl transition-all active:scale-95"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing citations...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" /> Start Verification
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

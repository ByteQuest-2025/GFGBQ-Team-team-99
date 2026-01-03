import { ExternalLink, Database, AlertTriangle, Fingerprint } from "lucide-react"

export function InsightRail({ visible, sources }: { visible: boolean; sources: any[] }) {
  return (
    <aside
      className={`fixed inset-y-0 right-0 w-80 glass border-l border-white/5 p-6 flex flex-col gap-8 transition-all duration-500 z-40 lg:relative lg:translate-x-0 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Database className="w-3 h-3" /> Evidence Sources
        </h3>
        <div className="space-y-3">
          {sources.map((source, index) => (
            <SourceItem
              key={index}
              title={source.title}
              url={source.url}
              verified={source.verified}
              suspicious={source.suspicious}
            />
          ))}
        </div>
      </section>

      <section className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-3 h-3" /> Hallucination Trigger
        </h3>
        <p className="text-xs leading-relaxed text-red-100/80">
          The model confused <span className="font-bold">Nobel Prize criteria</span> with{" "}
          <span className="font-bold">cultural impact</span>. Historically, Relativity's lack of experimental proof at
          the time prevented its inclusion in the 1921 prize.
        </p>
      </section>

      <section>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <Fingerprint className="w-3 h-3" /> Integrity Metadata
        </h3>
        <div className="space-y-4">
          <MetaItem label="Model Drift" value="High (4.2σ)" />
          <MetaItem label="Temporal Logic" value="Inconsistent" />
          <MetaItem label="Citation Bias" value="Zero detected" />
        </div>
      </section>

      <div className="mt-auto p-4 glass rounded-xl border-primary/20">
        <p className="text-[10px] text-muted-foreground mb-2">Verification Hash</p>
        <code className="text-[9px] font-mono break-all opacity-50">0x492k_f4c7_integrity_01923847</code>
      </div>
    </aside>
  )
}

function SourceItem({
  title,
  url,
  verified = false,
  suspicious = false,
}: { title: string; url: string; verified?: boolean; suspicious?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex flex-col">
        <span className="text-xs font-medium group-hover:text-primary transition-colors">{title}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          {url} <ExternalLink className="w-2 h-2" />
        </span>
      </div>
      {verified && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
      {suspicious && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono font-bold text-white/90">{value}</span>
    </div>
  )
}

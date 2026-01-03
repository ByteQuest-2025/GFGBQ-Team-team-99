import { SiteHeader } from "@/components/site-header"
import { Zap, Globe, Cpu, Layers, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function IntegrationsPage() {
  const integrations = [
    { name: "OpenAI GPT-4o", status: "Connected", latency: "14ms", icon: Cpu, type: "Core Model" },
    { name: "Anthropic Claude 3.5", status: "Active", latency: "18ms", icon: Zap, type: "Verification Peer" },
    { name: "Google Scholar API", status: "Secured", latency: "112ms", icon: Globe, type: "Ground Truth" },
    { name: "PubMed Central", status: "Secured", latency: "145ms", icon: Database, type: "Medical Evidence" },
    { name: "Crossref Metadata", status: "Active", latency: "89ms", icon: LinkIcon, type: "Citation Node" },
    { name: "ArXiv Search", status: "Connected", latency: "160ms", icon: Search, type: "Academic Node" },
  ]

  return (
    <main className="relative min-h-screen">
      <SiteHeader />

      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-widest uppercase">
                  <Layers className="w-4 h-4" /> Node Connectivity
                </span>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                  Global Engine <br /> <span className="text-primary italic">Mesh.</span>
                </h1>
                <p className="max-w-xl text-xl text-white/50 font-light leading-relaxed">
                  The TrustLayer mesh connects directly to the world's most powerful LLMs and factual databases to
                  create a zero-trust verification ecosystem.
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="h-14 px-8 rounded-2xl glow-primary font-bold">Configure Custom Node</Button>
                <Button variant="outline" className="h-14 px-8 rounded-2xl glass border-white/10 bg-transparent">
                  View API Docs
                </Button>
              </div>

              <div className="p-8 rounded-[2rem] glass border-white/5 space-y-6">
                <div className="text-xs font-bold text-white/30 tracking-[0.2em] uppercase">System Health</div>
                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono mb-2">
                      <span className="text-white/40">MESH_THROUGHPUT</span>
                      <span className="text-primary">98.4%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-mono mb-2">
                      <span className="text-white/40">API_UPTIME</span>
                      <span className="text-green-500">99.999%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {integrations.map((int, i) => (
                <div
                  key={i}
                  className="p-6 glass rounded-2xl border-white/5 hover:border-primary/30 transition-all group hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <int.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
                      {int.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold">{int.name}</h3>
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{int.type}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-4 border-t border-white/5">
                      <span className="text-white/20">LATENCY</span>
                      <span className="text-primary">{int.latency}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-6 glass rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-all">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4 group-hover:border-primary/40 transition-colors">
                  <LinkIcon className="w-6 h-6 text-white/20 group-hover:text-primary/40 transition-colors" />
                </div>
                <div className="text-sm font-bold text-white/20 group-hover:text-primary/40 transition-colors">
                  Add New Integration
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual background accents */}
      <div className="absolute top-[20%] right-0 w-[40%] h-[40%] bg-primary/5 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-500/5 blur-[150px] -z-10 rounded-full" />
    </main>
  )
}

import { Database, Search } from "lucide-react"

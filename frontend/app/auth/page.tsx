import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative p-4 bg-[#050505]">
      <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-10 animate-pulse" />

      <div className="max-w-md w-full glass p-8 md:p-12 rounded-[2.5rem] text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 transform transition-transform hover:rotate-12">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">TrustLayer Login</h1>
        <p className="text-muted-foreground mb-8 text-sm">Enter your credentials to access the verification engine.</p>

        <form className="space-y-4 text-left" action="/dashboard">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
              required
            />
          </div>
          <Button size="lg" className="w-full h-12 text-base font-semibold glow-primary mt-4 rounded-xl">
            Sign In
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-white/5" />
          <span>HACKATHON MODE</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      </div>
    </main>
  )
}

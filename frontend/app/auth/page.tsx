"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { login, register, isLoggedIn } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        if (!name.trim()) {
          throw new Error("Name is required")
        }
        await register(name, email, password)
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative p-4 bg-[#050505]">
      <div className="absolute inset-0 bg-primary/10 blur-[120px] -z-10 animate-pulse" />

      <div className="max-w-md w-full glass p-8 md:p-12 rounded-[2.5rem] text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 transform transition-transform hover:rotate-12">
          <Shield className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {isLogin
            ? "Sign in to access your verification dashboard"
            : "Join TrustLayer to start verifying AI outputs"}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
                disabled={loading}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50"
              disabled={loading}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold glow-primary mt-4 rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-white/5" />
          <span>OR</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin)
            setError("")
          }}
          className="mt-6 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span className="text-primary font-semibold">Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="text-primary font-semibold">Sign in</span>
            </>
          )}
        </button>

        <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-white/5" />
          <span>BYTE QUEST 2025</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      </div>
    </main>
  )
}

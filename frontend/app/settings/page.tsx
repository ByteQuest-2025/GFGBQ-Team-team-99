"use client"

import type React from "react"
import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileHeader } from "@/components/dashboard/mobile-header"
import { Settings, Shield, Bell, Zap, Database, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function SettingsContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get("reportId")

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div className="space-y-1">
          {reportId && (
            <Link
              href="/reports"
              className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-4 uppercase tracking-widest"
            >
              <ArrowLeft className="w-3 h-3" /> Back to reports
            </Link>
          )}
          <h1 className="text-2xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            <Settings className="w-6 md:w-8 h-6 md:h-8 text-primary" />
            {reportId ? `Report Config: ${reportId}` : "System Settings"}
          </h1>
          <p className="text-muted-foreground text-sm">Configure your global verification engine parameters.</p>
        </div>
        <Button className="glow-primary rounded-xl h-11 px-6 md:px-8 font-bold w-full md:w-auto">
          <Save className="w-4 h-4 mr-2" /> Save Config
        </Button>
      </header>

      <div className="space-y-6 md:space-y-8">
        <SettingsSection
          icon={Shield}
          title="Integrity Core"
          description="Primary hallucination detection and cross-reference thresholds."
        >
          <div className="space-y-6">
            <SettingItem
              label="Deep Citation Validation"
              description="Verify every link and reference against live web archives."
              defaultChecked
            />
            <SettingItem
              label="Semantic Drift Analysis"
              description="Detect logic inconsistencies in highly confident outputs."
              defaultChecked
            />
            <SettingItem
              label="Zero-Trust Citation Mode"
              description="Flag any citation that isn't from a pre-approved authority list."
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Database}
          title="Evidence Sources"
          description="Configure which data silos the engine cross-references."
        >
          <div className="space-y-6">
            <SettingItem
              label="Live Web Archives"
              description="Cross-reference claims with current news and public data."
              defaultChecked
            />
            <SettingItem label="Academic Databases" description="Access JSTOR, PubMed, and arXiv verification." />
            <SettingItem label="Enterprise Data (S3)" description="Connect your internal document storage." />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={Bell}
          title="Integrity Alerts"
          description="How should the engine notify you of critical failures?"
        >
          <div className="space-y-6">
            <SettingItem
              label="Slack Integration"
              description="Post reports with < 60% Trust Score to security channels."
            />
            <SettingItem label="Email Summaries" description="Daily audit logs of all verification sessions." />
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden selection:bg-primary/30">
      <MobileHeader />

      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 pt-20 lg:pt-10">
        <Suspense fallback={null}>
          <SettingsContent />
        </Suspense>
      </main>
    </div>
  )
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: { icon: any; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="glass p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-white/10 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Zap className="w-5 h-5 text-white/10 hidden md:block" />
      </div>
      <div className="h-px bg-white/5" />
      {children}
    </section>
  )
}

function SettingItem({
  label,
  description,
  defaultChecked = false,
}: { label: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start md:items-center justify-between gap-6 group p-6 rounded-[2rem] border border-transparent hover:border-white/5 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer relative overflow-hidden">
      {/* Dynamic hover glow effect */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl -z-10" />

      <div className="space-y-2 flex-1 relative z-10">
        <Label className="text-base md:text-lg font-black tracking-tight cursor-pointer group-hover:text-primary transition-colors flex items-center gap-2">
          {label}
          <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
        </Label>
        <p className="text-sm text-white/40 max-w-md leading-relaxed font-light">{description}</p>
      </div>

      <div className="relative flex items-center h-8 relative z-10">
        <Switch
          defaultChecked={defaultChecked}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10 border-none scale-[1.3] shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-500"
        />
        {/* Visible glow behind toggle when active */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  )
}

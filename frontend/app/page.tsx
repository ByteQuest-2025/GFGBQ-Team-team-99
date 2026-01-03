import { LandingHero, Features } from "@/components/landing-hero"
import { SiteHeader } from "@/components/site-header"
import { ScrollStory, ImpactSection } from "@/components/scroll-story"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SiteHeader />
      <LandingHero />
      <ScrollStory />
      <ImpactSection />
      <Features />

      {/* Background visual elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full -z-10" />
    </main>
  )
}

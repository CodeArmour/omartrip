import { DotGridBackground } from "@/components/background/DotGridBackground";
import { AboutSection } from "@/components/about/AboutSection";
import { HeroSection } from "@/components/hero/HeroSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { MoreToExploreSection } from "@/components/more-explore/MoreToExploreSection";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { SkillsSection } from "@/components/skills/SkillsSection";

export default function Home() {
  return (
    <>
      <DotGridBackground />
      <FloatingNavigation />

      <div className="site-shell">
        <main>
          <HeroSection />

          <AboutSection />

          <ProjectsSection />

          <SkillsSection />

          <MoreToExploreSection />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}

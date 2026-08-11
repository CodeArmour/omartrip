"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";

import heroOmar from "../../../public/hero-omar.png";
import { ProfileOwnerPanel } from "@/components/profile/ProfileOwnerPanel";
import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";
import { PortfolioAssistant } from "./PortfolioAssistant";

export function HeroSection() {
  const { profile } = usePortfolioProfile();
  return (
    <section
      id="home"
      className="hero-section anchor-section"
      aria-labelledby="hero-title"
    >
      <div className="hero-portrait-wrap hero-enter hero-enter-portrait">
        <Image
          className="hero-portrait"
          src={profile.portraitUrl || heroOmar}
          width={852}
          height={1846}
          alt={`Portrait of ${profile.fullName}`}
          sizes="(max-width: 760px) 190px, 230px"
          preload
        />
      </div>
      <div className="hero-introduction hero-enter hero-enter-heading">
        <p className="eyebrow hero-eyebrow">{profile.heroEyebrow}</p>
        <h1 id="hero-title" className="hero-heading">
          Hi, I&apos;m <span>{profile.fullName}</span>
        </h1>
      </div>
      <p className="hero-supporting hero-enter hero-enter-supporting">
        {profile.heroSupporting}
      </p>
      <ProfileOwnerPanel />
      <div className="hero-chat-wrap hero-enter hero-enter-chat">
        <PortfolioAssistant />
      </div>
      <a
        className="scroll-indicator hero-enter hero-enter-scroll"
        href="#about"
      >
        <span>Scroll to explore</span>
        <ArrowDown aria-hidden="true" size={17} strokeWidth={1.8} />
      </a>
    </section>
  );
}

"use client";

import { BadgeCheck, Clock3, Globe2, MapPin, Video } from "lucide-react";
import Image from "next/image";
import { usePortfolioProfile } from "@/components/profile/PortfolioProfileProvider";

export function MeetingDetails() {
  const { profile } = usePortfolioProfile();
  return (
    <section
      className="meeting-details"
      aria-labelledby="meeting-details-title"
    >
      <span className="meeting-avatar-frame">
        <Image
          className="meeting-avatar"
          src={profile.portraitUrl}
          alt={`Portrait of ${profile.fullName}`}
          width={244}
          height={325}
          sizes="244px"
          style={{
            objectFit: "contain",
          }}
        />
      </span>
      <p className="eyebrow">{profile.role}</p>
      <h2 id="meeting-details-title">{profile.fullName}</h2>
      <ul>
        <li>
          <BadgeCheck aria-hidden="true" />
          <span>Confirmation required</span>
        </li>
        <li>
          <Clock3 aria-hidden="true" />
          <span>30 min session</span>
        </li>
        <li>
          <Video aria-hidden="true" />
          <span>Online meeting</span>
        </li>
        <li>
          <MapPin aria-hidden="true" />
          <span>{profile.location}</span>
        </li>
        <li>
          <Globe2 aria-hidden="true" />
          <span>Europe/Brussels</span>
        </li>
      </ul>
    </section>
  );
}

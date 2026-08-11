import Image from "next/image";

import { mindsetItems, type MindsetItem } from "./aboutData";

type MindsetCardProps = {
  selectedId: MindsetItem["id"];
  onSelect: (id: MindsetItem["id"]) => void;
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
};

export function MindsetCard({
  selectedId,
  onSelect,
  onPreviewStart,
  onPreviewEnd,
}: MindsetCardProps) {
  return (
    <article
      className="about-card mindset-card"
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreviewStart}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onPreviewEnd();
      }}
    >
      <h3 className="about-card-title">Mindset</h3>
      <p className="mindset-intro">
        <strong>Building more than software.</strong> My passions provide the{" "}
        <strong>discipline and focus</strong> I need to grow.
      </p>

      <div className="mindset-stack" aria-label="Omar's mindset gallery">
        {mindsetItems.map((item, index) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              className="mindset-image-button"
              data-selected={isSelected || undefined}
              data-stack-index={index}
              onClick={() => onSelect(item.id)}
              aria-pressed={isSelected}
              aria-label={`Show ${item.label.toLowerCase()} image`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 760px) 48vw, 230px"
                style={{ objectPosition: item.position }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <p className="mindset-outro">
        <strong>Mastering body and mind</strong> is my path to{" "}
        <strong>excellence</strong>.
      </p>
    </article>
  );
}

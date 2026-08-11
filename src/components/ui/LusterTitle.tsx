"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";

type LusterTitleProps = {
  children: ReactNode;
  id: string;
};

type LusterStyle = CSSProperties & {
  "--title-luster-x": string;
  "--title-luster-y": string;
};

const inactiveLuster: LusterStyle = {
  "--title-luster-x": "-200px",
  "--title-luster-y": "50%",
};

export function LusterTitle({ children, id }: LusterTitleProps) {
  const updateLuster = (event: PointerEvent<HTMLHeadingElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--title-luster-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--title-luster-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  const resetLuster = (event: PointerEvent<HTMLHeadingElement>) => {
    event.currentTarget.style.setProperty("--title-luster-x", "-200px");
    event.currentTarget.style.setProperty("--title-luster-y", "50%");
  };

  return (
    <h2
      id={id}
      data-luster-title
      style={inactiveLuster}
      onPointerMove={updateLuster}
      onPointerLeave={resetLuster}
    >
      {children}
    </h2>
  );
}

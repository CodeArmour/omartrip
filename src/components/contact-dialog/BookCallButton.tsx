"use client";

import { CalendarDays } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import { useContactDialog } from "./ContactDialogProvider";

type BookCallButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "onClick" | "type"
>;

export function BookCallButton({ children, ...props }: BookCallButtonProps) {
  const { openContactDialog } = useContactDialog();
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pathname === "/book") {
      const scheduler = document.getElementById("booking-scheduler");
      scheduler?.scrollIntoView({ behavior: "smooth", block: "start" });
      scheduler?.focus({ preventScroll: true });
      return;
    }
    openContactDialog(event.currentTarget);
  };

  return (
    <button type="button" onClick={handleClick} {...props}>
      <CalendarDays aria-hidden="true" size={17} strokeWidth={1.8} />
      {children ?? <span>Book a Call</span>}
    </button>
  );
}

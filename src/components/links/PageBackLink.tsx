import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function PageBackLink() {
  return (
    <Link
      className="links-back-link links-enter links-enter-back"
      href="/#other"
    >
      <ArrowLeft aria-hidden="true" />
      <span>Back to home</span>
    </Link>
  );
}

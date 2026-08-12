import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ContactDialogProvider } from "@/components/contact-dialog/ContactDialogProvider";
import { PortfolioAuthProvider } from "@/components/auth/PortfolioAuthProvider";
import { PortfolioProfileProvider } from "@/components/profile/PortfolioProfileProvider";
import { ScrollRevealController } from "@/components/ui/ScrollRevealController";
import { ThemeBootstrap } from "@/components/theme/ThemeBootstrap";

import "./globals.css";

export const metadata: Metadata = {
  title: "Omar Abusahmoud — Software Developer",
  description: "Software developer based in Brussels, Belgium.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head />
      <body>
        <ThemeBootstrap />
        <ScrollRevealController />
        <PortfolioAuthProvider>
          <PortfolioProfileProvider>
            <ContactDialogProvider>{children}</ContactDialogProvider>
          </PortfolioProfileProvider>
        </PortfolioAuthProvider>
      </body>
    </html>
  );
}

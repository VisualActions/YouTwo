import type { Metadata } from "next";
// The design system's own stylesheet — tokens, fonts, and component styles.
// Imported before globals.css so app-level overrides still win.
import "@youtwo/ui-kit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTwo",
  description: "Self-hosted video sharing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}

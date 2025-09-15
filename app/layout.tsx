import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iExec Confidential AI Playground",
  description: "Run AI on private data using TEE-based compute."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}


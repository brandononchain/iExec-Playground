import "./global.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "iExec Confidential AI Playground",
  description: "Run AI on private data using TEE-based compute."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster theme="dark" richColors closeButton />
      </body>
    </html>
  );
}

